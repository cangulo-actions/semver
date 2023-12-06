const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the version released is {string}', (version) => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const url = `https://api.github.com/repos/${owner}/${repo}/tags`
  const expectedCode = 200

  cy
    .request({
      method: 'GET',
      url
    })
    .then((response) => {
      expect(response.status).to.equal(expectedCode)
      const tag = response.body.find((tag) => tag.name === version)
      // eslint-disable-next-line no-unused-expressions
      expect(tag).to.not.be.undefined
    })
})

Then('there are {string} versions in the repository', (totalVersions) => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const url = `https://api.github.com/repos/${owner}/${repo}/tags`
  const expectedCode = 200

  cy
    .request({
      method: 'GET',
      url
    })
    .then((response) => {
      expect(response.status).to.equal(expectedCode)
      expect(response.body).to.have.lengthOf(totalVersions)
    })
})
