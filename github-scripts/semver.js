const { BuildNextRelease } = require('../functions/build-next-release')

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ core, context }) => {
  const conf = JSON.parse(process.env.CONFIG)
  const changes = JSON.parse(process.env.CHANGES)
  const title = process.env.RELEASE_TITLE
  const changelogTemplates = {
    title: process.env.CHANGELOG_RECORD_TITLE_TEMPLATE,
    body: process.env.CHANGELOG_RECORD_BODY_TEMPLATE
  }

  const releaseDetails = BuildNextRelease(changes, title, conf, changelogTemplates)

  if (releaseDetails.releaseRequired) {
    core.startGroup(`Next version is ${releaseDetails.version}. Details (click here):`)
    console.log(JSON.stringify(releaseDetails, null, 2))
    core.endGroup()
  } else {
    core.startGroup('Commit merged did not trigger a new release. Commit details (click here):')
    const commitMerged = context.payload.commits[0]
    console.log(JSON.stringify(commitMerged, null, 2))
    core.endGroup()
  }

  core.setOutput('version', releaseDetails.version)
  core.setOutput('release-type', releaseDetails.releaseType)
  core.setOutput('release-required', releaseDetails.releaseRequired)
  core.setOutput('changelog-record', releaseDetails.changelogRecord)
  core.setOutput('scopes', releaseDetails.scopes)
}
