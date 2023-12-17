const { When } = require('@badeball/cypress-cucumber-preprocessor')

When('I create a PR with title {string} and merge it', (title) => {
  const semverPRNumber = Cypress.env('SEMVER_PR_NUMBER')
  const branch = Cypress.env('BRANCH_TO_CREATE')
  const description = `PR created for testing the cangulo-actions/semver GH action. Triggered by ci.yml in the PR cangulo-actions/semver#${semverPRNumber}`

  cy
    .createPR({ title, description, branch })
    .then((pr) => {
      console.log(`PR created: ${pr.number}`)
      cy
        .mergePR(pr.number)
        .then((mergeCommitSHA) => {
          console.log(`PR merged! merge commit SHA: ${mergeCommitSHA}`)
          cy.task('appendSharedData', `PR_MERGE_COMMIT_ID=${mergeCommitSHA}`)
        })
    })
})
