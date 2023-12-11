const { When } = require('@badeball/cypress-cucumber-preprocessor')

When('I create a PR and merge it', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const semverPRNumber = Cypress.env('SEMVER_PR_NUMBER')
  const description = `PR created by the CI workflow for the PR 
    cangulo-actions/semver#${semverPRNumber} in the ${owner}/${repo} repository. 
    Created for testing the GH action behavior.`

  cy
    .exec(`gh pr create --fill --body "${description}"`, { failOnNonZeroExit: false })
    .then((result) => {
      let prNumber = ''
      if (result.code === 0) {
        // result.stdout contains https://github.com/.../pull/$PR_NUMBER
        prNumber = result.stdout.split('/').pop()
        expect(prNumber).to.match(/^\d+$/)
      } else if (result.stderr !== '') {
        expect(result.stderr).to.contain('already exists', 'PR already exists')
        prNumber = result.stderr.split('/').pop()
        expect(prNumber).to.match(/^\d+$/)
      }
      cy
        .exec(`gh pr merge ${prNumber} --squash --delete-branch --admin`)
        .exec(`gh pr view ${prNumber} --json mergeCommit --jq .mergeCommit.oid`)
        .then((result) => {
          const prMergeCommitId = result.stdout
          cy.task('appendSharedData', `PR_MERGE_COMMIT_ID=${prMergeCommitId}`)
        })
    })
})
