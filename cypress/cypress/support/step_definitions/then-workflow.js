const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the workflow {string} must conclude in {string}', (workflowName, conclusion) => {
  const waitTimeCD = Cypress.env('WAIT_TIME_CD_WORKFLOW')
  const retryInterval = Cypress.env('API_RETRY_INTERVAL_MS')
  const maxTimeout = Cypress.env('API_RETRY_TIMEOUT_MS')
  const branch = 'main'
  const event = 'push'
  const status = 'completed'

  cy
    .task('getSharedDataByKey', 'PR_MERGE_COMMIT_ID')
    .then((prMergeCommitId) => {
      const headSha = prMergeCommitId
      cy
        .wait(waitTimeCD)
        .waitUntil(() => {
          return cy
            .getRuns({ branch, event, headSha, status })
            .then((runs) => {
              return runs.workflow_runs.find((run) => run.name === workflowName) !== undefined
            })
        }, {
          interval: retryInterval,
          timeout: maxTimeout,
          errorMsg: `The ${workflowName} workflow did not finish in time.`
        })
        .then(() => {
          cy
            .getRuns({ branch, event, headSha, status })
            .then((runs) => {
              const commitValidationRun = runs.workflow_runs.find((run) => run.name === workflowName)
              expect(commitValidationRun.conclusion).to.equal(conclusion, `the ${workflowName} workflow must result in ${conclusion}`)
            })
        })
    })
})
