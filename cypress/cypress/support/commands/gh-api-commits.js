Cypress.Commands.add('getLastCommit', () => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitsUrl = `${ghAPIUrl}/commits?per_page=1`
  const expectedCode = 200

  return cy
    .request(
      {
        method: 'GET',
        url: getCommitsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when getting the commits is not expected.')

      const lastCommit = {
        message: response.body[0].commit.message,
        sha: response.body[0].sha
      }
      return lastCommit
    })
})

Cypress.Commands.add('ensureCommitReleasesANewVersion', (commitMsg) => {
  const releaseCommitMsgPrefix = '[skip ci] created release'
  expect(commitMsg)
    .to.include(releaseCommitMsgPrefix, 'the last commit did not release a new version.')
})

Cypress.Commands.add('getCommitCheckRuns', ({ commitId, checkName, status }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const encodedCheckName = encodeURIComponent(checkName)
  const getCommitsUrl = `${ghAPIUrl}/commits/${commitId}/check-runs?check_name=${encodedCheckName}&status=${status}&per_page=1}`
  const expectedCode = 200

  return cy
    .request(
      {
        method: 'GET',
        url: getCommitsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when getting the commits is not expected.')

      return response.body.check_runs
    })
})
