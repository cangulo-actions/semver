const { When, Then, Given } = require('@badeball/cypress-cucumber-preprocessor')

let branch
let prNumber = ''
let prMergeCommitId = ''
let prMergeDate = ''
const waitTimeMs = 30000

Given('I checkout {string} branch', (branchName) => {
  const prNumber = Cypress.env('SEMVER_PR_NUMBER')
  branch = branchName.replace('{SEMVER_PR_NUMBER}', prNumber)
  cy.exec(`git checkout -b ${branch}`)
})

When('I commit the next change {string}', (commitMsg) => {
  cy
    .exec(`git commit --allow-empty -m "${commitMsg}"`)
    .exec(`git push origin ${branch} --force`)
})

When('I commit the next changes', (table) => {
  table.rows().forEach(row => {
    const commitMsg = row[0]
    cy
      .exec(`git commit --allow-empty -m "${commitMsg}"`)
  })
  cy
    .exec(`git push origin ${branch} --force`)
})

When('I create a PR', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const semverPRNumber = Cypress.env('SEMVER_PR_NUMBER')
  const description = `PR created by the CI workflow for the PR #${semverPRNumber} in the ${owner}/${repo} repository. Created for testing the GH action behavior.`
  cy.exec(`gh pr create --fill --body "${description}"`, { failOnNonZeroExit: false })
    .then((result) => {
      if (result.code === 0) {
      // result.stdout contains https://github.com/.../pull/$PR_NUMBER
        prNumber = result.stdout.split('/').pop()
        expect(prNumber).to.match(/^\d+$/)
      } else if (result.stderr !== '') {
        expect(result.stderr).to.contain('already exists', 'PR already exists')
        prNumber = result.stderr.split('/').pop()
        expect(prNumber).to.match(/^\d+$/)
      }
    })
})

When('I merge it', () => {
  cy
    .exec(`gh pr merge ${prNumber} --squash --delete-branch --admin`)
    .then((result) => {
      prMergeDate = new Date().toISOString().split('T')[0]
    })
    .exec(`gh pr view ${prNumber} --json mergeCommit --jq .mergeCommit.oid`)
    .then((result) => {
      prMergeCommitId = result.stdout
    })
})

Then('the CD workflow triggered must succeed', () => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy
    .wait(waitTimeMs)
    .exec(
      `gh run list -b main -L 1 -w "cd.yml" --created "${prMergeDate}" --json headSha,conclusion --jq ".[] | {headSha: .headSha, conclusion: .conclusion}"`,
      { failOnNonZeroExit: false })
    .then((result) => {
      const lastRunDetailsJSON = result.stdout
      const lastRunDetails = JSON.parse(lastRunDetailsJSON)
      expect(lastRunDetails.headSha).to.equal(prMergeCommitId, 'headSha must be the same as the PR merge commit')
      expect(lastRunDetails.conclusion).to.equal('success', 'conclusion must be success')
    })
})
