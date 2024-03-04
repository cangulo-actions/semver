const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the {string} content must be:', (file, fileContent) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getContent({ owner: OWNER, repo: REPO, file, branch: 'main' })
        .then((response) => {
          const responseContent = Buffer.from(response.content, 'base64').toString()
          const responseObject = JSON.parse(responseContent)
          const expectedObject = JSON.parse(fileContent)
          expect(responseObject).to.deep.equal(expectedObject)
        })
    })
})
