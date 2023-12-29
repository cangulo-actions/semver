const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('all GH releases are deleted', () => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getGHReleases({ owner: OWNER, repo: REPO })
        .then((release) => {
          release
            .forEach((release) => {
              cy.log(`Deleting release: ${release.tag_name}`)
              cy.deleteGHRelease({ owner: OWNER, repo: REPO, releaseId: release.id })
            })
        })
    })
})
