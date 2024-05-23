Cypress.Commands.add('getTags', ({ owner, repo }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getTagsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/git/matching-refs/tags/`

  return cy
    .request({
      method: 'GET',
      url: getTagsUrl,
      headers: {
        Authorization: `token ${Cypress.env('GH_TOKEN')}`
      }
    }).then((response) => {
      return response.body
    })
})

Cypress.Commands.add('getTag', ({ owner, repo, tagSha }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getTagUrl = `${ghAPIUrl}/repos/${owner}/${repo}/git/tags/${tagSha}`

  return cy
    .request({
      method: 'GET',
      url: getTagUrl,
      headers: {
        Authorization: `token ${Cypress.env('GH_TOKEN')}`
      }
    }).then((response) => {
      return response.body
    })
})

Cypress.Commands.add('deleteTag', ({ owner, repo, tag }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const deleteTagUrl = `${ghAPIUrl}/repos/${owner}/${repo}/git/refs/tags/${tag}`

  return cy.request({
    method: 'DELETE',
    url: deleteTagUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    }
  })
})
