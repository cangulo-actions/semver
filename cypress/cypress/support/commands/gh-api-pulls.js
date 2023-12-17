Cypress.Commands.add('createPR', ({ title, description, branch }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/pulls`
  const expectedCode = 201

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
          head: branch,
          title,
          body: description
        }
      }
    )
    .then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when creating the PR is not the expected one')

      const pr = {
        id: response.body.id,
        number: response.body.number
      }
      return pr
    })
})

Cypress.Commands.add('mergePR', (number) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const pullsUrl = `${ghAPIUrl}/pulls/${number}/merge`
  const expectedCode = 200

  return cy
    .request(
      {
        method: 'PUT',
        url: pullsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        },
        body: {
          merge_method: 'squash'
        }
      }
    )
    .then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when merging the PR is not the expected one')

      const mergeCommit = response.body.sha
      return mergeCommit
    })
})
