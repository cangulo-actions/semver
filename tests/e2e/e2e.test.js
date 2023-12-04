const exec = require('@actions/exec')
const fs = require('fs')

describe('E2E tests', () => {
  const timeout = 1000 * 60 * 5 // 5 minutes
  const maxRetries = 3
  const secondsBetweenRetries = 20
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
  const semverPRNumber = process.env.PR_NUMBER || random(1, 100)

  const testDataPath = process.env.TEST_DATA_PATH ?? './tests/e2e/e2e.test.data.json'
  const testDataContent = fs.readFileSync(testDataPath, 'utf8')
  const testData = JSON.parse(testDataContent)
  const testCases = testData.filter(t => t.enabled)

  beforeAll(async () => {
    await customExec('git restore .')
    await customExec('git checkout main')
    await customExec('git pull')

    await customExec('git config user.name "cangulo-semver-e2e-test[bot]"')
    await customExec('git config user.email "cangulo-semver-e2e-test[bot]@users.noreply.github.com"')
  })

  for (const test of testCases) {
    it(test.scenario, async () => {
      // arrange
      const branchToCreate = test.branch.replace('@PR_NUMBER', semverPRNumber)

      let semverBranchUnderTest = ''
      if (process.env.SEMVER_BRANCH) {
        semverBranchUnderTest = process.env.SEMVER_BRANCH
      } else {
        const { stdout } = await exec.getExecOutput('git rev-parse --abbrev-ref HEAD')
        semverBranchUnderTest = stdout.trim()
      }
      console.log(`semverBranchUnderTest: ${semverBranchUnderTest}`)

      console.log(`Scenario: ${test.scenario}`)

      const initialVersion = await customExec('git describe --abbrev=0')
      console.log(`initialVersion: ${initialVersion}`)

      await customExec(`git checkout -B ${branchToCreate}`)

      for (const commit of test.commits) {
        const commitCleaned = commit.replace('SEMVER_BRANCH_UNDER_TEST', semverBranchUnderTest)
        console.log(`commit: ${commitCleaned}`)
        await customExec(`sed -i s|cangulo-actions/semver@.*|cangulo-actions/semver@${semverBranchUnderTest}|g .github/workflows/cd.yml`)
        await customExec(`git commit --allow-empty -am "${commitCleaned}"`)
      }

      await customExec(`git push origin ${branchToCreate} --force`)

      const prLink = await customExec('gh pr create --fill')
      const prNumber = prLink.split('/').pop()
      console.log(`PR Created ${prNumber}`)

      await customExec(`gh pr merge ${prNumber} --squash --delete-branch --admin`)
      const mergeCommit = await customExec(`gh pr view ${prNumber} --json mergeCommit --jq .mergeCommit.oid`)
      console.log(`mergeCommit: ${mergeCommit}`)

      // act
      console.log('pr merged. Waiting for the workflow to complete...')
      let retryCount = 0

      console.log(`waiting ${secondsBetweenRetries} seconds before checking if the workflow is completed`)
      await new Promise(resolve => setTimeout(resolve, secondsBetweenRetries * 1000))

      // set current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0]

      const getLastRunCommand = `gh run list -b main -L 1 -w "cd.yml" --created "${currentDate}" --json headSha,conclusion --jq ".[] | {headSha: .headSha, conclusion: .conclusion}"`
      let lastRunDetailsJSON = await customExec(getLastRunCommand)
      let lastRunDetails = JSON.parse(lastRunDetailsJSON)

      while ((mergeCommit !== lastRunDetails.headSha || lastRunDetails.conclusion !== 'success') && retryCount < maxRetries) {
        console.log(`Waiting ${secondsBetweenRetries} seconds before checking if the workflow is completed`)
        await new Promise(resolve => setTimeout(resolve, secondsBetweenRetries * 1000))

        lastRunDetailsJSON = await customExec(getLastRunCommand)
        lastRunDetails = JSON.parse(lastRunDetailsJSON)

        if (lastRunDetails.conclusion === 'failure') {
          throw new Error('Workflow failed. Exiting...')
        }
        retryCount++
      }

      if (retryCount === maxRetries) {
        console.error('Max retries reached. Exiting...')
        throw new Error('Max retries reached. Exiting...')
      }

      // assert
      console.log('Workflow completed successfully. Getting the tag released')

      await customExec('git restore .')
      await customExec('git checkout main')
      await customExec('git pull')

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

      const refTag = await customExec(`gh api repos/{owner}/{repo}/git/matching-refs/tags/${expectedTag} --jq ".[0].ref"`)
      const tagReleased = refTag.replace('refs/tags/', '')
      console.log(`tagReleased: ${tagReleased}`)

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

// refresh E2E execution 20231202-1
