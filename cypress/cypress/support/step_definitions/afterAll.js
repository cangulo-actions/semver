import { AfterAll } from '@badeball/cypress-cucumber-preprocessor'

AfterAll(function () {
  const enabled = Cypress.env('AFTER_ALL_RESET_REPO_ENABLED')

  if (!enabled) {
    console.log('trigger reset repo workflow skipped')
    return
  }

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
})
