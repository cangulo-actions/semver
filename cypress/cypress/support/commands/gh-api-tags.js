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
      // return the tag name only
      return response.body.map(x => x.ref.replace('refs/tags/', ''))
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
