Cypress.Commands.add('repoExists', ({ org, repo }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getRepoUrl = `${ghAPIUrl}/repos/${org}/${repo}`

  return cy.request({
    method: 'GET',
    url: getRepoUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    failOnStatusCode: false
  }).then((response) => {
    return response.status === 200
  })
})

Cypress.Commands.add('createRepo', ({ org, repo, configuration }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const createRepoUrl = `${ghAPIUrl}/orgs/${org}/repos`
  const defaultRepo = {
    name: repo,
    private: true,
    visibility: 'private',
    has_issues: false,
    has_projects: false,
    has_wiki: false,
    has_downloads: false,
    allow_merge_commit: false,
    allow_rebase_merge: false,
    allow_auto_merge: false,
    delete_branch_on_merge: true,
    auto_init: true
  }

  return cy.request({
    method: 'POST',
    url: createRepoUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      ...defaultRepo,
      ...configuration
    }
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('setTopics', ({ org, repo, topics }) => {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const setTopicsUrl = `${ghAPIUrl}/repos/${org}/${repo}/topics`

  return cy.request({
    method: 'PUT',
    url: setTopicsUrl,
    headers: {
      Authorization: `token ${Cypress.env('GH_TOKEN')}`
    },
    body: {
      names: topics
    }
  }).then((response) => {
    return response.body
  })
})
