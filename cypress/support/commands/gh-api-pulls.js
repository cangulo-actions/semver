Cypress.Commands.add('createPR', ({ owner, repo, title, description, head }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/pulls`

  return cy
    .request(
      {
        method: 'POST',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: {
          base: 'main',
          head,
          title,
          body: description
        }
      }
    )
    .then((response) => {
      const pr = {
        id: response.body.id,
        number: response.body.number,
        headSha: response.body.head.sha
      }
      return pr
    })
})

Cypress.Commands.add('mergePR', ({ owner, repo, number }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/pulls/${number}/merge`

  return cy
    .request(
      {
        method: 'PUT',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: {
          merge_method: 'squash',
          delete_branch: true
        }
      }
    )
    .then((response) => {
      const mergeCommit = response.body.sha
      return mergeCommit
    })
})

Cypress.Commands.add('closePR', ({ owner, repo, number }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/pulls/${number}`

  return cy
    .request(
      {
        method: 'PATCH',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: {
          state: 'closed'
        }
      }
    )
    .then((response) => {
      const mergeCommit = response.body.sha
      return mergeCommit
    })
})

Cypress.Commands.add('getPR', ({ owner, repo, number }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/repos/${owner}/${repo}/pulls/${number}`

  return cy
    .request(
      {
        method: 'GET',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      return response.body
    })
})
