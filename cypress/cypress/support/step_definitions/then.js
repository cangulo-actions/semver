const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the CD workflow triggered must succeed', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const waitTimeMs = Cypress.env('WAIT_TIME_MS')

  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy
    .wait(waitTimeMs)
    .task('getSharedDataByKey', 'prMergeCommitId')
    .then((prMergeCommitId) => {
      cy
        .exec(`gh api repos/${owner}/${repo}/commits/${prMergeCommitId}/check-runs`)
        .then((result) => {
          const checksJSON = result.stdout
          const checks = JSON.parse(checksJSON)

          expect(checks.total_count).to.equal(1, `There must be only one check, but there are ${checks.total_count}`)
          expect(checks.check_runs[0].status).to.equal('completed', `The check must be completed, but it is ${checks.check_runs[0].status}`)
          expect(checks.check_runs[0].conclusion).to.equal('success', `The check must be successful, but it is ${checks.check_runs[0].conclusion}`)

          const checkRunId = checks.check_runs[0].id
          cy.task('appendSharedData', `checkRunId=${checkRunId}`)
        })
    })
})

Then('the version released is {string}', (version) => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const expectedCode = 200
  const annotationMessage = version !== 'none' ? `Version ${version} released!` : 'Changes did not triggered a new release'
  const expectedTitle = 'cangulo-actions/semver result'

  cy
    .task('getSharedDataByKey', 'checkRunId')
    .then((checkRunId) => {
      const getAnnotationsUrl = `https://api.github.com/repos/${owner}/${repo}/check-runs/${checkRunId}/annotations`
      cy.request({
        method: 'GET',
        url: getAnnotationsUrl
      }).then((response) => {
        expect(response.status).to.equal(expectedCode, `the response code received when getting the annotations is not expected. Expected: ${expectedCode}, Actual: ${response.status}`)
        expect(response.body).to.have.lengthOf(1, `the number of annotations is not expected. Expected: 1, Actual: ${response.body.length}`)
        expect(response.body[0].message).to.contain(annotationMessage, `the annotation message is not expected. Expected: ${annotationMessage}, Actual: ${response.body[0].message}`)
        expect(response.body[0].title).to.equal(expectedTitle, `the annotation title is not expected. Expected: ${expectedTitle}, Actual: ${response.body[0].title}`)
      })
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
      expect(response.status).to.equal(expectedCode, `the response code received when getting the tags is not expected. Expected: ${expectedCode}, Actual: ${response.status}`)
      expect(response.body).to.have.lengthOf(totalVersions, `the number of tags in the repo is not expected. Expected: ${totalVersions}, Actual: ${response.body.length}`)
    })
})
