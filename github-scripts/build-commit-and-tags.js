// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ core }) => {
  core.startGroup('Building commit and tags')

  const tagRepoVersion = process.env.TAG_VERSION === 'true'
  const conf = JSON.parse(process.env.CONFIG)
  const supportedScopesConfig = conf.scopes.list
  const releaseTitle = process.env.RELEASE_TITLE
  const changelogRecordBody = process.env.CHANGELOG_RECORD_BODY
  const repoTagVersion = process.env.REPO_TAG_VERSION
  const repoTagPrefix = process.env.TAG_PREFIX
  const scopes = JSON.parse(process.env.SCOPES)
  const tags = []

  const releaseCommit = {
    title: `[skip ci] created release ${repoTagVersion} - ${releaseTitle}`,
    body: changelogRecordBody
  }

  if (tagRepoVersion) {
    const repoVersionTag = {
      name: `${repoTagPrefix}${repoTagVersion}`,
      title: releaseTitle,
      body: changelogRecordBody
    }
    tags.push(repoVersionTag)
  }

  const tagsPerScope = {}
  for (const [scope, properties] of Object.entries(scopes)) {
    const scopeConfig = supportedScopesConfig.find(x => x.key === scope)
    const tagVersion = scopeConfig.versioning['tag-version'] ?? conf.scopes['tag-version']
    const tagPrefix = scopeConfig.versioning['tag-prefix'] ?? conf.scopes['tag-prefix']
    if (tagVersion) {
      const tagName = `${scope}-${tagPrefix}${properties.version}`
      tagsPerScope[scope] = tagName
      const scopeTag = {
        name: tagName,
        title: releaseTitle,
        body: properties.changelogRecord.body
      }
      tags.push(scopeTag)
    }
  }

  console.log('release commit:', JSON.stringify(releaseCommit, null, 2))
  console.log('tags:', JSON.stringify(tags, null, 2))
  console.log('tags per scope:', JSON.stringify(tagsPerScope, null, 2))

  core.setOutput('release-commit', releaseCommit)
  core.setOutput('tags', tags)
  core.setOutput('tags-per-scope', tagsPerScope)

  core.endGroup()
}
