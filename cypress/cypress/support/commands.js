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

Cypress.Commands.add('ensureCommitReleasesANewVersion', (commit) => {
  const releaseCommitMsgPrefix = '[skip ci] created release'
  expect(commit.message)
    .to.include(releaseCommitMsgPrefix, 'the last commit did not release a new version.')

  return commit
})

Cypress.Commands.add('ensureLastReleaseMatchCommit', (commitSha) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getReleases = `${ghAPIUrl}/releases?per_page=1`
  const expectedCode = 200

  return cy.request({
    method: 'GET',
    url: getReleases,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  }).then((response) => {
    expect(response.status)
      .to.equal(expectedCode, 'the response code received when getting the tags is not expected.')
    const releaseCommit = response.body[0].target_commitish
    expect(releaseCommit).to.equal(commitSha, 'the last release sha does not macth the release commit sha.')
  })
})

Cypress.Commands.add('getGHReleases', (pageSize) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getReleases = `${ghAPIUrl}/releases?per_page=${pageSize}`
  const expectedCode = 200

  return cy.request({
    method: 'GET',
    url: getReleases,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  }).then((response) => {
    expect(response.status)
      .to.equal(expectedCode, 'the response code received when getting the tags is not expected.')
    return response.body
  })
})
