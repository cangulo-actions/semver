const { When } = require('@badeball/cypress-cucumber-preprocessor')

When('I merge it', () => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, PR_NUMBER } = sharedData
      cy
        .mergePR({ owner: OWNER, repo: REPO, number: PR_NUMBER })
        .then((mergeCommitSHA) => {
          cy
            .log(`PR merged! merge commit SHA: ${mergeCommitSHA}`)
            .task('appendSharedData', `PR_MERGE_COMMIT_ID=${mergeCommitSHA}`)
        })
    })
})
