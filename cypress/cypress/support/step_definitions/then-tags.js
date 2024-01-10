const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the repository must have {string} tags', (numberOfTags) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getTags({ owner: OWNER, repo: REPO })
        .then((tags) => {
          expect(tags).to.have.lengthOf(parseInt(numberOfTags), `the repository must have ${numberOfTags} tags`)
          const tagsJSON = JSON.stringify(tags)
          cy.task('appendSharedData', `TAGS=${tagsJSON}`)
        })
    })
})

Then('the only tag must be {string}', (tag) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { TAGS } = sharedData
      const tags = JSON.parse(TAGS)
      expect(tags[0].name).to.equal(tag, `the only tag must be ${tag}`)
    })
})
