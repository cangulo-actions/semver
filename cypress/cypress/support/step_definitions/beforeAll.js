import { BeforeAll } from '@badeball/cypress-cucumber-preprocessor'

BeforeAll(function () {
  const resetRepoEnabled = Cypress.env('BEFORE_ALL_RESET_REPO_ENABLED')
  const closePRsEnabled = Cypress.env('BEFORE_ALL_CLOSE_ANY_PR')

  if (resetRepoEnabled) {
    const waitTimeWorkflow = Cypress.env('GH_WORKFLOW_RESET_REPO_TIMEOUT')
    const semverBranchName = Cypress.env('SEMVER_BRANCH')
    const workflowId = 'reset-repo.yml'
    const workflowParams = {
      ref: 'main',
      inputs: {
        'semver-version': semverBranchName,
        'enable-ci-workflow': false
      }
    }

    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy
      .triggerWorkflow({ workflowId, workflowParams })
      .wait(waitTimeWorkflow)
  }

  if (closePRsEnabled) {
    // if any PR is pending because of a previous failing execution, close it
    cy.closeAnyPendingPR()
  }
})
