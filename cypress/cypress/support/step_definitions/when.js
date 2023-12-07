const { When } = require('@badeball/cypress-cucumber-preprocessor')

When('I commit the next change {string}', (commitMsg) => {
  cy
    .task('getSharedDataByKey', 'branch')
    .then((branch) => {
      cy
        .exec(`git commit --allow-empty -m "${commitMsg}"`)
        .exec(`git push origin ${branch} --force`)
    })
})

When('I commit the next changes', (table) => {
  table
    .rows()
    .forEach(row => {
      const commitMsg = row[0]
      cy.exec(`git commit --allow-empty -m "${commitMsg}"`)
    })
  cy
    .task('getSharedDataByKey', 'branch')
    .then((branch) => {
      cy.exec(`git push origin ${branch} --force`)
    })
})

When('I create a PR', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const semverPRNumber = Cypress.env('SEMVER_PR_NUMBER')
  const description = `PR created by the CI workflow for the PR #${semverPRNumber} in the ${owner}/${repo} repository. Created for testing the GH action behavior.`

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
      cy.task('appendSharedData', `prNumber=${prNumber}`)
    })
})

When('I merge it', () => {
  cy
    .task('getSharedDataByKey', 'prNumber')
    .then((prNumber) => {
      cy
        .exec(`gh pr merge ${prNumber} --squash --delete-branch --admin`)
        .exec(`gh pr view ${prNumber} --json mergeCommit --jq .mergeCommit.oid`)
        .then((result) => {
          const prMergeCommitId = result.stdout
          cy.task('appendSharedData', `prMergeCommitId=${prMergeCommitId}`)
        })
    })
})
