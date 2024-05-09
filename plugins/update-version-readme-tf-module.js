const fs = require('fs')

// expected string:
// source = "github.com/{OWNER}/{REPO}.git?ref={PREVIOUS_VERSION}"

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
// @ts-ignore
module.exports = async ({ core }) => {
  const file = 'README.md'
  const { TAG_PREFIX, RELEASE_VERSION, GITHUB_REPOSITORY } = process.env
  // GITHUB_REPOSITORY includes the owner and repo name, e.g. "owner/repo"
  const regexMatch = new RegExp(`${GITHUB_REPOSITORY}.git\\?ref=(?<PREVIOUS_VERSION>.*)"$`, 'gm')
  const newVersionString = `${GITHUB_REPOSITORY}.git?ref=${TAG_PREFIX}${RELEASE_VERSION}"`
  const content = fs.readFileSync(file, 'utf8')
  const newContent = content.replace(regexMatch, newVersionString)
  if (content !== newContent) {
    fs.writeFileSync(file, newContent)
    core.info(`Updated version in ${file} to "${newVersionString}"`)
  } else {
    core.info('no match found')
  }
}
