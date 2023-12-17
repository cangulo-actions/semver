import { BeforeAll } from '@badeball/cypress-cucumber-preprocessor'

BeforeAll(function () {
  const waitTimeWorkflow = Cypress.env('WAIT_TIME_RESET_REPO_WORKFLOW')
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
})
