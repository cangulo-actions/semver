import { AfterAll } from '@badeball/cypress-cucumber-preprocessor'

AfterAll(function () {
  const waitTimeWorkflow = Cypress.env('WAIT_TIME_RESET_REPO_WORKFLOW')
  const workflowId = 'reset-repo.yml'
  const workflowParams = {
    ref: 'main',
    inputs: {
      'semver-version': 'main',
      'enable-ci-workflow': true
    }
  }

  // eslint-disable-next-line cypress/unsafe-to-chain-command
  cy
    .triggerWorkflow({ workflowId, workflowParams })
    .wait(waitTimeWorkflow)
})
