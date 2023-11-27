const exec = require('@actions/exec')

const testData = [
  {
    scenario: 'Merge a PR with a single commit fixing a bug',
    testId: 'PR_1_COMMIT_FIX',
    enabled: true,
    commits: [
      'fix: [cd.yml] updated to cangulo-actions/semver@SEMVER_BRANCH_UNDER_TEST'
    ],
    increase: 'patch',
    branch: 'test-semver-pr1-commit'
  },
  {
    scenario: 'Merge a PR with a single commit that does not trigger a release',
    testId: 'PR_1_COMMIT_NO_RELEASE',
    enabled: true,
    commits: [
      'ci: [cd.yml] updated to cangulo-actions/semver@SEMVER_BRANCH_UNDER_TEST'
    ],
    increase: 'none',
    branch: 'test-semver-pr1-commit'
  },
  {
    scenario: 'Merge a PR with three commits introducing a breaking change, fixing a bug and adding a feature',
    testId: 'PR_3_COMMITS_BREAK_FIX_FEAT',
    enabled: true,
    commits: [
      'fix: [cd.yml] updated to cangulo-actions/semver@SEMVER_BRANCH_UNDER_TEST',
      'break: #123 random commit that breaks something',
      'feat: #123 random commit that adds a feature'
    ],
    increase: 'major',
    branch: 'test-semver-pr3-commit'
  }

]

describe('E2E test', () => {
  beforeAll(async () => {
    await customExec('git restore .', [])
    await customExec('git checkout main', [])
    await customExec('git pull', [])
  })

  const timeout = 1000 * 60 * 5 // 5 minutes
  let semverBranchUnderTest = ''
  if (process.env.SEMVER_BRANCH) {
    semverBranchUnderTest = process.env.SEMVER_BRANCH
  } else {
    throw new Error('SEMVER_BRANCH env var is required')
  }

  let testCases = testData.filter(t => t.enabled)
  if (process.env.TEST_ID && process.env.TEST_ID !== '' && testData.find(t => t.testId === process.env.TEST_ID)) {
    testCases = [testData.find(t => t.testId === process.env.TEST_ID)]
  }

  for (const test of testCases) {
    const branchToCreate = test.branch

    it(test.scenario, async () => {
      const initialVersion = await customExec('git describe --abbrev=0', [])
      console.log(`initialVersion: ${initialVersion}`)

      await customExec('git config user.name "cangulo-semver-e2e-test[bot]"', [])
      await customExec('git config user.email "cangulo-semver-e2e-test[bot]@users.noreply.github.com"', [])

      await customExec(`git checkout -B ${branchToCreate}`, [])

      for (const commit of test.commits) {
        const commitCleaned = commit.replace('SEMVER_BRANCH_UNDER_TEST', semverBranchUnderTest)
        console.log(`commit: ${commitCleaned}`)
        await customExec(`sed -i s|cangulo-actions/semver@.*|cangulo-actions/semver@${semverBranchUnderTest}|g .github/workflows/cd.yml`, [])
        await customExec(`git commit --allow-empty -am "${commitCleaned}"`, [])
      }

      await customExec(`git push origin ${branchToCreate} --force `, [])

      try {
        await customExec('gh pr create --fill', [])
      } catch (error) {
        console.log(`Error creating PR: ${error}`)
      }
      let prNumber = await customExec(`gh pr list -B main -H ${branchToCreate} --state open --json number`, [])
      prNumber = JSON.parse(prNumber)[0].number
      console.log(`PR Created ${prNumber}`)

      await customExec(`gh pr merge ${prNumber} --squash --delete-branch --admin`)
      const mergeCommit = await customExec(`gh pr view ${prNumber} --json mergeCommit --jq .mergeCommit.oid`, [])
      console.log(`mergeCommit: ${mergeCommit}`)

      console.log('pr merged. Waiting for the workflow to complete...')

      let retryCount = 0
      const maxRetries = 3
      const secondsBetweenRetries = 20

      console.log(`waiting ${secondsBetweenRetries} seconds before checking if the workflow is completed`)
      await new Promise(resolve => setTimeout(resolve, secondsBetweenRetries * 1000))

      let lastRunCommit = await customExec('gh run list -b main -L 1 --status completed --json headSha', [])
      lastRunCommit = JSON.parse(lastRunCommit)[0].headSha

      while (mergeCommit !== lastRunCommit && retryCount < maxRetries) {
        console.log(`Waiting ${secondsBetweenRetries} seconds before checking if the workflow is completed`)
        await new Promise(resolve => setTimeout(resolve, secondsBetweenRetries * 1000))
        lastRunCommit = await customExec('gh run list -b main -L 1 --status completed --json headSha', [])
        lastRunCommit = JSON.parse(lastRunCommit)[0].headSha
        retryCount++
      }

      if (retryCount === maxRetries) {
        console.error('Max retries reached. Exiting...')
        throw new Error('Max retries reached. Exiting...')
      }

      console.log('Workflow completed successfully. Getting the tag released')

      await customExec('git restore .', [])
      await customExec('git checkout main', [])
      await customExec('git pull', [])

      const tagReleased = await customExec('git describe --abbrev=0', [])
      console.log(`tagReleased: ${tagReleased}`)

      let [major, minor, patch] = initialVersion.split('.')
      if (test.increase === 'major') {
        major = parseInt(major) + 1
        minor = 0
        patch = 0
      } else if (test.increase === 'minor') {
        minor = parseInt(minor) + 1
        patch = 0
      } else if (test.increase === 'patch') {
        patch = parseInt(patch) + 1
      }
      const expectedTag = `${major}.${minor}.${patch}`
      expect(tagReleased).toBe(expectedTag)
    }, timeout)
  }
})

async function customExec (command, args) {
  const options = {
    // requires you to have the CrazyActionsTests repo cloned in the REPOR_PATH env variable or locally in ../CrazyActionsTests
    cwd: process.env.REPO_PATH ?? '../CrazyActionsTests'
  }
  const { stdout } = await exec.getExecOutput(command, args, options)
  return stdout.trim()
}
