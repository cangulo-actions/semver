const { parseChange } = require('../functions/parse-change')
const { parseLastCommit } = require('../functions/parse-last-commit')

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = ({ core, context }) => {
  core.startGroup('Parsing changes from last commit')

  const conf = JSON.parse(process.env.CONFIG)
  const commitMsg = context.payload.commits[0].message
  const previousChanges = JSON.parse(process.env.PREVIOUS_CHANGES)

  const { title, entries } = parseLastCommit(commitMsg)
  console.log(`title: ${title}`)
  console.log('entries:', JSON.stringify(entries, null, 2))

  const changes = entries
    .map(x => parseChange(x, conf.commits))
    .concat(previousChanges)
  console.log('changes:', JSON.stringify(changes, null, 2))

  core.setOutput('changes', changes)
  core.setOutput('release-title', title)

  core.endGroup()
}
