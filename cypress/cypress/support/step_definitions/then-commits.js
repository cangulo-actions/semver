const { Then, Step } = require('@badeball/cypress-cucumber-preprocessor')

Then('the last commit message must start with {string}', (msgPrefix) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getLastCommit({ owner: OWNER, repo: REPO })
        .then((lastCommit) => {
          // msgPrefix might include characters that need to be escaped for regex
          const msgPrefixClean = msgPrefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
          const regex = new RegExp(`^${msgPrefixClean}`)
          expect(lastCommit.message).to.match(regex, `last commit message starts with ${msgPrefix}`)
          const lastCommitJSON = JSON.stringify(lastCommit)
          cy.task('appendSharedData', `LAST_COMMIT=${lastCommitJSON}`)
        })
    })
})

Then('the last commit message contain {string}', (text) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getLastCommit({ owner: OWNER, repo: REPO })
        .then((lastCommit) => {
          expect(lastCommit.message).to.include(text, `last commit message contains ${text}`)
          const lastCommitJSON = JSON.stringify(lastCommit)
          cy.task('appendSharedData', `LAST_COMMIT=${lastCommitJSON}`)
        })
    })
})

Then('the last commit must be tagged with {string}', (tag) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, LAST_COMMIT } = sharedData
      const lastCommit = JSON.parse(LAST_COMMIT)
      const lastCommitId = lastCommit.sha
      cy
        .getTags({ owner: OWNER, repo: REPO })
        .then((tags) => {
          const tagNames = tags.map((t) => t.ref.replace('refs/tags/', ''))
          expect(tagNames).to.include(tag, `tag ${tag} exists`)

          const matchingTag = tags.find((t) => t.ref.replace('refs/tags/', '') === tag)

          cy
            .getTag({ owner: OWNER, repo: REPO, tagSha: matchingTag.object.sha })
            .then((tag) => {
              expect(tag.object.sha).to.equal(lastCommitId, `tag ${tag} points to the last commit`)
            })
        })
    })
})

Then('the last commit must be tagged with:', (table) => {
  table
    .rows()
    .forEach((row) => {
      const tag = row[0]
      Step(this, `the last commit must be tagged with "${tag}"`)
    })
})
