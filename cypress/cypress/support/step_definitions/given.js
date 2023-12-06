const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('the initial version is {string}', (initialVersion) => {
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
      if (initialVersion === 'none') {
        expect(response.body).to.deep.equal([])
      } else {
        const tag = response.body.find((tag) => tag.name === initialVersion)
        // eslint-disable-next-line no-unused-expressions
        expect(tag).to.not.be.undefined
      }
    })
})

Given('The repository does not have any version', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const url = `https://api.github.com/repos/${owner}/${repo}/tags`
  const expectedCode = 200
  const expectedBody = []

  cy
    .request({
      method: 'GET',
      url
    })
    .then((response) => {
      expect(response.status).to.equal(expectedCode)
      expect(response.body).to.deep.equal(expectedBody)
    })
})
