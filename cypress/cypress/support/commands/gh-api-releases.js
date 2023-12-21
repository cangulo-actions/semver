Cypress.Commands.add('ensureLastReleaseMatchCommit', (commitSha) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getReleases = `${ghAPIUrl}/releases?per_page=1`

  return cy.request({
    method: 'GET',
    url: getReleases,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  }).then((response) => {
    const releaseCommit = response.body[0].target_commitish
    expect(releaseCommit).to.equal(commitSha, 'the last release sha does not match the release commit sha.')
  })
})

Cypress.Commands.add('getGHReleases', (pageSize) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getReleases = `${ghAPIUrl}/releases?per_page=${pageSize}`

  return cy.request({
    method: 'GET',
    url: getReleases,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  }).then((response) => {
    return response.body
  })
})
