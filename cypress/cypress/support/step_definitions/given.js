const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('the repository does not have any version', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const url = `https://api.github.com/repos/${owner}/${repo}/tags`
  const expectedCode = 200
  const expectedNumTags = 0

  cy
    .request({
      method: 'GET',
      url
    })
    .then((response) => {
      expect(response.status).to.equal(expectedCode, `the response code received when getting the tags is not expected. Expected: ${expectedCode}, Actual: ${response.status}`)
      expect(response.body).to.have.lengthOf(expectedNumTags, `the number of tags in the repo is not expected. Expected: ${expectedNumTags}, Actual: ${response.body.length}`)
    })
})

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
      expect(response.status).to.equal(expectedCode, `the response code received when getting the tags is not expected. Expected: ${expectedCode}, Actual: ${response.status}`)
      if (initialVersion === 'none') {
        expect(response.body).to.deep.equal([])
      } else {
        // eslint-disable-next-line no-unused-expressions
        const lastTag = response.body[0] // tags are sorted by date, so the first one is the last one
        expect(lastTag.name).to.equal(initialVersion, 'the last tag does not match the initial version')
      }
    })
})

Given('I checkout {string} branch', (branchName) => {
  const prNumber = Cypress.env('SEMVER_PR_NUMBER')
  const branch = branchName.replace('{SEMVER_PR_NUMBER}', prNumber)
  cy
    .task('appendSharedData', `branch=${branch}`)
    .exec(`git checkout -b ${branch}`)
})
