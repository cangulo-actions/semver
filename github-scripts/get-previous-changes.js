const { parseChange } = require('../functions/parse-change')
const { parseLastCommit } = require('../functions/parse-last-commit')

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ core, github, context }) => {
  core.startGroup('Getting changes from previous commits')

  const conf = JSON.parse(process.env.CONFIG)

  const { data: versionJSONCommits } = await github.rest.repos.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: 'version.json'
  })

  if (versionJSONCommits.length === 0) {
    core.notice('version.json file not found. Getting Previous changes is not supported in this case', { title: 'cangulo-actions/semver notice' })
    return
  }

  const lastReleaseCommitSHA = versionJSONCommits[0].sha
  const currentCommitSHA = context.payload.commits[0].id

  const { data: comparison } = await github.rest.repos.compareCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    base: lastReleaseCommitSHA,
    head: currentCommitSHA
  })

  const previousChanges = []
  comparison.commits
    .filter(x => x.sha !== currentCommitSHA) // ignore the current commit because it will be parsed later
    .map(x => x.commit.message)
    .forEach(commitMsg => {
      const { entries } = parseLastCommit(commitMsg)
      const changes = entries
        .map(x => parseChange(x, conf.commits))
      previousChanges.push(...changes)
    })

  console.log('previousChanges:', JSON.stringify(previousChanges, null, 2))
  core.setOutput('previous-changes', previousChanges)

  core.endGroup()
}
