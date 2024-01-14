const fs = require('fs')
const nunjucks = require('nunjucks')

function buildChangelogRecord (changes, nextVersion, title, templatesPath) {
  const changesPerReleaseType = changes.groupBy(change => change.releaseAssociated)

  const templateParams = {
    version: nextVersion,
    title,
    changesPerReleaseType
  }
  const recordTitle = fillTemplate(templatesPath.title, templateParams)
  const recordBody = fillTemplate(templatesPath.body, templateParams)
  const content = `${recordTitle}\n${recordBody}`
  return { title: recordTitle, body: recordBody, content }
}

function updateChangelog (newContent, changelogPath) {
  let changelogContent = ''
  if (fs.existsSync(changelogPath)) {
    changelogContent = fs.readFileSync(changelogPath)
  }

  changelogContent = `${newContent}\n${changelogContent}`
  fs.writeFileSync(changelogPath, changelogContent)
}

function fillTemplate (templatePath, params) {
  const templateContent = fs.readFileSync(templatePath, 'utf8')
  return nunjucks.renderString(templateContent.toString(), params)
}

module.exports = {
  buildChangelogRecord,
  updateChangelog
}
