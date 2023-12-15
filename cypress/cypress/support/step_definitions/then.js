const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the CD workflow triggered must succeed', () => {
  const owner = Cypress.env('OWNER')
  const repo = Cypress.env('REPO')
  const waitTimeMs = Cypress.env('WAIT_TIME_MS')

  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy
    .wait(waitTimeMs)
    .task('getSharedDataByKey', 'PR_MERGE_COMMIT_ID')
    .then((prMergeCommitId) => {
      cy
        .exec(`gh api repos/${owner}/${repo}/commits/${prMergeCommitId}/check-runs`)
        .then((result) => {
          const checksJSON = result.stdout
          const checks = JSON.parse(checksJSON).check_runs
          expect(checks.length).to.be.greaterThan(0, 'There must be at least one check run. Please retry the whole ci.yml workflow.')
          const releaseCheck = checks.find(check => check.name === 'release new version')
          // eslint-disable-next-line no-unused-expressions
          expect(releaseCheck).to.not.be.undefined
          expect(releaseCheck.status).to.equal('completed', `The check must be completed, but it is ${releaseCheck.status}. Please retry the whole ci.yml workflow.`)
          expect(releaseCheck.conclusion).to.equal('success', `The check must be successful, but it is ${releaseCheck.conclusion}`)

          const checkRunId = releaseCheck.id
          cy.task('appendSharedData', `checkRunId=${checkRunId}`)
        })
    })
})

Then('the release commit created includes the tag {string}', (expectedTag) => {
  if (expectedTag === 'none') {
    cy
      .getLastCommit()
      .then((lastCommit) => {
        const releaseCommitMsgPrefix = '[skip ci] created release'
        const lastCommitMessage = lastCommit.message
        expect(lastCommitMessage).to.not.include(releaseCommitMsgPrefix, 'the last commit released a new version, but it should not have.')
      })
  } else {
    checkReleaseCommitIncludesTags([expectedTag])
  }
})

Then('the release commit created includes the next tags', (table) => {
  const expectedTags = table.rows().map(row => row[0])
  checkReleaseCommitIncludesTags(expectedTags)
})

Then('the new release must only increase the patch number', () => {
  cy
    .getLastCommit()
    .then((lastCommit) => {
      cy.ensureCommitReleasesANewVersion(lastCommit)
      const releaseCommit = lastCommit.sha
      cy.ensureLastReleaseMatchCommit(releaseCommit)

      const releasesToCheck = 2
      cy
        .getGHReleases(releasesToCheck)
        .then((releases) => {
          if (releases.length === 1) {
            expect(releases[0].tag_name).to.equal('0.0.1', 'the tag version does not match a initial patch release.')
          } else {
            const previousTag = releases[1].tag_name
            const [previousMajor, previousMinor, previousPatch] = previousTag.split('.').map(version => parseInt(version))
            const newTag = releases[0].tag_name
            const [newMajor, newMinor, newPatch] = newTag.split('.').map(version => parseInt(version))
            expect(newMajor).to.equal(previousMajor, 'the major version must not change.')
            expect(newMinor).to.equal(previousMinor, 'the minor version must not change.')
            expect(newPatch).to.equal(previousPatch + 1, 'the patch version must increase by one.')
          }
        })
    })
})

function checkReleaseCommitIncludesTags (expectedTags) {
  cy
    .getLastCommit()
    .then((lastCommit) => {
      cy.ensureCommitReleasesANewVersion(lastCommit)
      const releaseCommit = lastCommit.sha
      cy.ensureLastReleaseMatchCommit(releaseCommit)

      const numberOfTags = expectedTags.length
      const ghAPIUrl = Cypress.env('GH_API_URL')
      const expectedCode = 200
      const getTagsUrl = `${ghAPIUrl}/tags?per_page=${numberOfTags}`

      cy.request({
        method: 'GET',
        url: getTagsUrl
      }).then((response) => {
        expect(response.status)
          .to.equal(expectedCode, 'the response code received when getting the tags is not expected.')
        expect(response.body)
          .to.have.lengthOf(numberOfTags, `the number of tags is not expected after calling to ${getTagsUrl}`)

        const repoTags = response.body
        expectedTags.forEach((expectedTag) => {
          expect(expectedTag).to.be.oneOf(repoTags.map(repoTag => repoTag.name))
        })
        repoTags.forEach((repoTag) => {
          expect(repoTag.commit.sha).to.equal(releaseCommit, 'the tag sha is not the same as the release tag.')
        })
      })
    })
}
