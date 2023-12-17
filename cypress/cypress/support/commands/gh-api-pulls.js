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

      const lastCommit = {
        message: response.body[0].commit.message,
        sha: response.body[0].sha
      }
      return lastCommit
    })
})
