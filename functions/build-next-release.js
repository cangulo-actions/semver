const { calculateNextVersion, getReleaseType } = require('./calculate-next-version')
const { buildChangelogRecord, updateChangelog } = require('./changelog')

// eslint-disable-next-line no-unused-vars
const { groupBy } = require('core-js/actual/array/group-by')

const fs = require('fs')
const repoChangesConfig = {
  changelog: 'CHANGELOG.md',
  versionJsonPath: 'version.json'
}

function BuildNextRelease (changes, title, conf, changelogTemplates) {
  const result = {
    releaseRequired: false,
    version: '',
    releaseType: '',
    changelogRecord: {},
    scopes: {}
  }

  const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, repoChangesConfig.versionJsonPath)
  result.releaseRequired = requiresNewRelease

  if (requiresNewRelease) {
    result.version = nextVersion
    result.releaseType = nextReleaseType

    const newChangelogRecord = buildChangelogRecord(changes, nextVersion, title, changelogTemplates)
    updateChangelog(newChangelogRecord.content, repoChangesConfig.changelog)
    updateVersionJsonFile(nextVersion, repoChangesConfig.versionJsonPath)
    result.changelogRecord = newChangelogRecord

    const commitsContainAnyScope = changes.some(change => change.scopes.length > 0)
    if (commitsContainAnyScope && conf.scopes.list.length > 0) {
      const scopesSupported = conf.scopes.list
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
          updateVersionJsonFile(nextVersion, versionJsonPath)

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

function checkForNextRelease (changes, versionJsonPath) {
  let currentVersion = '0.0.0'
  if (fs.existsSync(versionJsonPath)) {
    const versionJsonContent = fs.readFileSync(versionJsonPath)
    currentVersion = JSON.parse(versionJsonContent).version
  }

  const releases = changes.map(x => x.releaseAssociated)
  const nextReleaseType = getReleaseType(releases)
  const nextVersion = calculateNextVersion(currentVersion, releases)
  const requiresNewRelease = nextVersion !== currentVersion
  return { requiresNewRelease, nextVersion, nextReleaseType }
}

function updateVersionJsonFile (nextVersion, versionJsonPath) {
  let versionJsonContent = {}
  if (fs.existsSync(versionJsonPath)) {
    const currentContent = fs.readFileSync(versionJsonPath)
    versionJsonContent = JSON.parse(currentContent)
  }
  versionJsonContent.version = nextVersion
  const versionJson = JSON.stringify(versionJsonContent, null, '\t')
  fs.writeFileSync(versionJsonPath, versionJson)
}

module.exports = {
  BuildNextRelease
}
