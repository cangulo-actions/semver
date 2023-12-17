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

Cypress.Commands.add('closeAnyPendingPR', () => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const branch = Cypress.env('BRANCH_TO_CREATE')
  const pullsUrl = `${ghAPIUrl}/pulls`
  const expectedCode = 200

  return cy
    .request(
      {
        method: 'GET',
        url: `${pullsUrl}?state=open&head=cangulo-actions:${branch}`,
        headers: {
          Authorization: `token ${Cypress.env('GH_TOKEN')}`
        }
      }
    )
    .then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when listing previous PRs is not the expected one')

      const prNumbers = response.body.map((pr) => pr.number)
      for (const prNumber of prNumbers) {
        cy.request(
          {
            method: 'PATCH',
            url: `${pullsUrl}/${prNumber}`,
            headers: {
              Authorization: `token ${Cypress.env('GH_TOKEN')}`
            },
            body: {
              state: 'closed'
            }
          }
        ).then((response) => {
          expect(response.status)
            .to.equal(expectedCode, `the response code received when closing previous the PR ${prNumber} is not the expected one`)
        })
      }
    })
})
