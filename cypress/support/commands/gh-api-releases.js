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

Cypress.Commands.add('getGHReleases', ({ owner, repo }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getReleases = `${ghAPIUrl}/repos/${owner}/${repo}/releases`

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

Cypress.Commands.add('deleteGHRelease', ({ owner, repo, releaseId }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const deleteRelease = `${ghAPIUrl}/repos/${owner}/${repo}/releases/${releaseId}`

  return cy.request({
    method: 'DELETE',
    url: deleteRelease,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  })
})
