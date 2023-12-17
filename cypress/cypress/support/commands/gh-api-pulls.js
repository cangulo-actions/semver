Cypress.Commands.add('createPR', ({ title, description }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitsUrl = `${ghAPIUrl}/pulls`
  const expectedCode = 201

  return cy
    .request(
      {
        method: 'POST',
        url: getCommitsUrl,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
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
