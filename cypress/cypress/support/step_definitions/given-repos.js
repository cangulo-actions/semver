const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('I create a {string} repository named {string}', (repoVisibility, repoName) => {
  const org = Cypress.env('GH_ORG')
  const testKey = Cypress.env('TEST_KEY')
  const semverPRNumber = Cypress.env('SEMVER_PR_NUMBER')
  const repoConfiguration = {
    private: repoVisibility === 'private',
    visibility: repoVisibility,
    description: `PR created for testing cangulo-actions/semver GH action. Created by the PR#${semverPRNumber} and the test key ${testKey}`
  }
  const repoTopics = ['test-semver', `semver-pr-${semverPRNumber}`]

  const repo = repoName
    .replace('{PR_NUMBER}', semverPRNumber)
    .replace('{TEST_KEY}', testKey)

  cy
    .repoExists({ org, repo })
    .then((exists) => {
      if (!exists) {
        cy.log(`Repo ${repo} does not exists. Creating it...`)
        cy
          .createRepo({ org, repo, configuration: repoConfiguration })
          .then((repoCreated) => {
            cy.log(`Repo Created: ${repoCreated.full_name}`)
            cy
              .task('appendSharedData', `REPO=${repoCreated.name}`)
              .task('appendSharedData', `OWNER=${repoCreated.owner.login}`)
            cy.log('adding topics')
            cy.setTopics({ org, repo, topics: repoTopics })
          })
      } else {
        cy.log(`Repo ${repo} already exists`)
        cy
          .task('appendSharedData', `REPO=${repo}`)
          .task('appendSharedData', `OWNER=${org}`)
      }
    })
})

Given('I add a branch protection rule for {string}', (branch) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .setBranchProtection({ owner: OWNER, repo: REPO, branch })
        .then((branchProtected) => {
          cy.log(`Branch ${branchProtected} protected`)
        })
    })
})
