import { AfterAll } from '@badeball/cypress-cucumber-preprocessor'

AfterAll(function () {
  const resetRepoEnabled = Cypress.env('AFTER_ALL_RESET_REPO_ENABLED')
  const closePRsEnabled = Cypress.env('AFTER_ALL_CLOSE_ANY_PR')

  if (resetRepoEnabled) {
    const waitTimeWorkflow = Cypress.env('GH_WORKFLOW_RESET_REPO_TIMEOUT')
    const workflowId = 'reset-repo.yml'
    const workflowParams = {
      ref: 'main',
      inputs: {
        'semver-version': 'main',
        'enable-ci-workflow': false
      }
    }

    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy
      .triggerWorkflow({ workflowId, workflowParams })
      .wait(waitTimeWorkflow)
  } else {
    console.log('trigger reset repo workflow skipped')
  }

  if (closePRsEnabled) {
    // if any PR is pending because of a previous failing execution, close it
    cy.closeAnyPendingPR()
  }
})
