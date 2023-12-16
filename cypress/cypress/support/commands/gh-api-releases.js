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
