const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('I checkout a branch', () => {
  const semverPRNumber = Cypress.env('SEMVER_PR_NUMBER')
  const branch = `test-semver-pr-${semverPRNumber}`
  cy
    .exec('git checkout main')
    .exec('git pull')
    .exec(`git branch -D ${branch} || true`)
    .exec(`git checkout -b ${branch}`)
    .task('appendSharedData', `BRANCH_NAME=${branch}`)
})

Given('I commit the next change {string}', (commitMsg) => {
  commitAndPushChanges([commitMsg])
})

Given('I commit the next changes', (table) => {
  const commitMsgs = table.rows().map(row => row[0])
  commitAndPushChanges(commitMsgs)
})

function commitAndPushChanges (commitMsgs) {
  commitMsgs.forEach(commitMsg => {
    cy.exec(`git commit --allow-empty -m "${commitMsg}"`)
  })

  cy
    .task('getSharedDataByKey', 'BRANCH_NAME')
    .then((branch) => {
      cy.exec(`git push origin ${branch} --force`)
    })
}
