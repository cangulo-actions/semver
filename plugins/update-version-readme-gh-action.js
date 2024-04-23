const fs = require('fs')

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
// @ts-ignore
module.exports = async ({ core }) => {
  const file = 'README.md'
  const { RELEASE_VERSION, GITHUB_REPOSITORY } = process.env
  const regexMatch = new RegExp(`${GITHUB_REPOSITORY}@(?<RELEASE_VERSION>.*)$`, 'gm')

  core.info(`regexMatch: ${regexMatch}`)

  const content = fs.readFileSync(file, 'utf8')
  const newContent = content.replace(regexMatch, `${GITHUB_REPOSITORY}@${RELEASE_VERSION}`)
  fs.writeFileSync(file, newContent)
  core.info(`Updated version in ${file} to ${GITHUB_REPOSITORY}@${RELEASE_VERSION}`)
}
