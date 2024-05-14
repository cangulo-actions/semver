const { calculateNextVersion, getReleaseType } = require('./calculate-next-version')
const { buildChangelogRecord, updateChangelog } = require('./changelog')

const fs = require('fs')

function BuildNextRelease (changes, title, config, changelogTemplates) {
  const result = {
    releaseRequired: false,
    version: '',
    releaseType: '',
    changelogRecord: {},
    scopes: {}
  }

  const repoChangesConfig = {
    changelog: config.versioning.changelog,
    versionFile: config.versioning.file
  }

  const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, repoChangesConfig.versionFile)
  result.releaseRequired = requiresNewRelease

  if (requiresNewRelease) {
    result.version = nextVersion
    result.releaseType = nextReleaseType

    const newChangelogRecord = buildChangelogRecord(changes, nextVersion, title, changelogTemplates)
    updateChangelog(newChangelogRecord.content, repoChangesConfig.changelog)
    updateVersionFile(nextVersion, repoChangesConfig.versionFile)
    result.changelogRecord = newChangelogRecord

    const commitsContainAnyScope = changes.some(change => change.scopes.length > 0)
    if (commitsContainAnyScope && config.scopes.list.length > 0) {
      const scopesSupported = config.scopes.list
      const scopesResult = {}
      const changesByScope = changes
        .flatMap(change => change.scopes.map(scope => ({ scope, change })))
        .reduce((acc, entry) => {
          acc[entry.scope] = (acc[entry.scope] || []).concat(entry.change)
          return acc
        }, {})

      for (const [scope, changes] of Object.entries(changesByScope)) {
        const scopeConfig = scopesSupported.find(x => x.key === scope)
        const versionJsonPath = scopeConfig.versioning.file
        const changelogPath = scopeConfig.versioning.changelog
        const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, versionJsonPath)

        if (requiresNewRelease) {
          const newChangelogRecord = buildChangelogRecord(changes, nextVersion, title, changelogTemplates)
          updateChangelog(newChangelogRecord.content, changelogPath)
          updateVersionFile(nextVersion, versionJsonPath)

          scopesResult[scope] = {
            version: nextVersion,
            releaseType: nextReleaseType,
            changes,
            changelogRecord: newChangelogRecord
          }
        }
      }
      result.scopes = scopesResult
    }
  }

  return result
}

function checkForNextRelease (changes, versionFilePath) {
  let currentVersion = '0.0.0'
  if (fs.existsSync(versionFilePath)) {
    const versionFileContent = fs.readFileSync(versionFilePath)
    currentVersion = JSON.parse(versionFileContent).version
  }

  const releases = changes.map(x => x.releaseAssociated)
  const nextReleaseType = getReleaseType(releases)
  const nextVersion = calculateNextVersion(currentVersion, releases)
  const requiresNewRelease = nextVersion !== currentVersion
  return { requiresNewRelease, nextVersion, nextReleaseType }
}

function updateVersionFile (nextVersion, versionFilePath) {
  let versionFileContent = {}
  if (fs.existsSync(versionFilePath)) {
    const currentContent = fs.readFileSync(versionFilePath)
    versionFileContent = JSON.parse(currentContent)
  }
  versionFileContent.version = nextVersion
  const versionJson = JSON.stringify(versionFileContent, null, '\t')
  fs.writeFileSync(versionFilePath, versionJson)
}

module.exports = {
  BuildNextRelease
}
