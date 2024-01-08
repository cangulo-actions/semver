const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('there are no tags', () => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getTags({ owner: OWNER, repo: REPO })
        .then((tags) => {
          tags
            .forEach((tag) => {
              cy.log(`Deleting tag ${tag}`)
              cy.deleteTag({ owner: OWNER, repo: REPO, tag })
            })
        })
    })
})
