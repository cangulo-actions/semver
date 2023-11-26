const { calculateNextVersion, getReleaseType } = require('./functions/calculate-next-version')
const { updateChangelog } = require('./functions/changelog')
const { parseChange } = require('./functions/parse-change')
const { parseLastCommit } = require('./functions/parse-last-commit')
const { groupBy } = require('core-js/actual/array/group-by')

const fs = require('fs')
const repoChangesConfig = {
    changelog: 'CHANGELOG.md',
    versionJsonPath: 'version.json'
}

function Index(context, core, conf) {
    const commits = context.payload.commits
    const commitMsg = commits[0].message

    const { title, entries } = parseLastCommit(commitMsg)
    const changes = entries.map(x => parseChange(x, conf.changeTypes))
    const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, repoChangesConfig.versionJsonPath)

    if (requiresNewRelease) {
        const newChangelogRecord = updateChangelog(changes, nextVersion, title, repoChangesConfig.changelog)
        updateVersionJsonFile(nextVersion, repoChangesConfig.versionJsonPath)

        const repoChangesResult = {
            version: nextVersion,
            releaseType: nextReleaseType,
            title: title,
            changes: changes,
            changelogRecord: newChangelogRecord,
        }

        core.startGroup('New release for the whole repo')
        console.log(repoChangesResult)
        core.endGroup()

        core.setOutput("version", repoChangesResult.version)
        core.setOutput("release-type", repoChangesResult.releaseType)
        core.setOutput("release-title", repoChangesResult.title)
        core.setOutput("changes", repoChangesResult.changes)
        core.setOutput("changelog-record", repoChangesResult.changelogRecord)
    }

    const commitsContainAnyScope = changes.some(change => change.scopes.length > 0)
    if (commitsContainAnyScope && conf.scopes) {
        let scopesResult = {}
        const changesByScope = changes
            .flatMap(change => change.scopes.map(scope => ({ scope, change })))
            .reduce((acc, entry) => {
                acc[entry.scope] = (acc[entry.scope] || []).concat(entry.change)
                return acc
            }, {})

        for (const [scope, changes] of Object.entries(changesByScope)) {
            const versionJsonPath = conf.scopes[scope].versioning?.file ?? `${scope}/version.json`
            const changelogPath = conf.scopes[scope].versioning?.changelog ?? `${scope}/CHANGELOG.md`
            const { requiresNewRelease, nextVersion, nextReleaseType } = checkForNextRelease(changes, versionJsonPath)

            if (requiresNewRelease) {
                const newChangelogRecord = updateChangelog(changes, nextVersion, title, changelogPath)
                updateVersionJsonFile(nextVersion, versionJsonPath)
                scopesResult[scope] = {
                    version: nextVersion,
                    releaseType: nextReleaseType,
                    changes: changes,
                    "changelog-record": newChangelogRecord,
                }
            }
        }

        core.startGroup('new releases per scope')
        console.log(scopesResult)
        core.endGroup()

        core.setOutput("scopes", scopesResult)
    }
}

module.exports = {
    Index
}

function checkForNextRelease(changes, versionJsonPath) {

    let currentVersion = '0.0.0'
    if (fs.existsSync(versionJsonPath)) {
        const versionJsonContent = fs.readFileSync(versionJsonPath)
        currentVersion = JSON.parse(versionJsonContent).version
    }

    const releases = changes.map(x => x.releaseAssociated)
    const nextReleaseType = getReleaseType(releases)
    const nextVersion = calculateNextVersion(currentVersion, releases)
    const requiresNewRelease = nextVersion != currentVersion
    return { requiresNewRelease, nextVersion, nextReleaseType }
}

function updateVersionJsonFile(nextVersion, versionJsonPath) {
    const versionJson = JSON.stringify({ version: nextVersion }, null, "\t")
    fs.writeFileSync(versionJsonPath, versionJson)
}
