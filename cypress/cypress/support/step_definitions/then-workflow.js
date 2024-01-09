const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the workflow {string} must conclude in {string}', (workflowName, conclusion) => {
  const waitTimeCD = Cypress.env('WAIT_TIME_CD_WORKFLOW')
  const retryInterval = Cypress.env('API_RETRY_INTERVAL_MS')
  const maxTimeout = Cypress.env('API_RETRY_TIMEOUT_MS')
  const branch = 'main'
  const event = 'push'
  const status = 'completed'

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, PR_MERGE_COMMIT_ID } = sharedData
      const owner = OWNER
      const repo = REPO
      const headSha = PR_MERGE_COMMIT_ID
      cy
        .wait(waitTimeCD)
        .waitUntil(() => {
          return cy
            .getRuns({ owner, repo, branch, event, headSha, status })
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
            .getRuns({ owner, repo, branch, event, headSha, status })
            .then((runs) => {
              const commitValidationRun = runs.workflow_runs.find((run) => run.name === workflowName)
              expect(commitValidationRun.conclusion).to.equal(conclusion, `the ${workflowName} workflow must result in ${conclusion}`)
            })
        })
    })
})

Then('the next annotation must be listed:', (table) => {
  const title = table.rows()[0][0]
  const message = table.rows()[0][1]
  const annotationLevel = table.rows()[0][2]

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, PR_MERGE_COMMIT_ID } = sharedData
      cy
        .getCommitCheckRuns({ owner: OWNER, repo: REPO, commitId: PR_MERGE_COMMIT_ID })
        .then((checkRuns) => {
          expect(checkRuns.length).to.equal(1, 'there must be only one check run')
          const checkRun = checkRuns[0]
          const checkRunId = checkRun.id
          cy
            .getCheckRunAnnotations({ owner: OWNER, repo: REPO, checkRunId })
            .then((annotations) => {
              expect(annotations.length).to.equal(1, 'there must be only one annotation')
              const annotation = annotations[0]
              expect(annotation.title).to.equal(title, 'the annotation title must match')
              expect(annotation.message).to.equal(message, 'the annotation message must match')
              expect(annotation.annotation_level).to.equal(annotationLevel, 'the annotation level must match')
            })
        })
    })
})
