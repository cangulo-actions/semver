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
          const checks = JSON.parse(checksJSON)

          expect(checks.total_count).to.equal(1, `There must be only one check, but there are ${checks.total_count}`)
          expect(checks.check_runs[0].status).to.equal('completed', `The check must be completed, but it is ${checks.check_runs[0].status}. Please retry the whole ci.yml workflow.`)
          expect(checks.check_runs[0].conclusion).to.equal('success', `The check must be successful, but it is ${checks.check_runs[0].conclusion}`)

          const checkRunId = checks.check_runs[0].id
          cy.task('appendSharedData', `checkRunId=${checkRunId}`)
        })
    })
})

Then('the release commit created includes the tag {string}', (expectedTag) => {
  if (expectedTag === 'none') {
    const expectedCode = 200
    const lastCommitMessageWhenNewRelease = '[skip ci] created release'
    const ghAPIUrl = Cypress.env('GH_API_URL')

    const getCommits = `${ghAPIUrl}/commits`
    cy.request({
      method: 'GET',
      url: getCommits
    }).then((response) => {
      expect(response.status)
        .to.equal(expectedCode, 'the response code received when getting the commits is not expected.')
      const lastCommitMessage = response.body[0].commit.message
      expect(lastCommitMessage).to.not.include(lastCommitMessageWhenNewRelease, 'the last commit released a new version, but it should not have.')
    })
  } else {
    checkReleaseCommitIncludesTags([expectedTag])
  }
})

Then('the release commit created includes the next tags', (table) => {
  const expectedTags = table.rows().map(row => row[0])
  checkReleaseCommitIncludesTags(expectedTags)
})

function checkReleaseCommitIncludesTags (expectedTags) {
  const ghAPIUrl = Cypress.env('GH_API_URL')
  const getCommitsUrl = `${ghAPIUrl}/commits`
  const expectedCode = 200

  cy.request({
    method: 'GET',
    url: getCommitsUrl
  }).then((response) => {
    expect(response.status)
      .to.equal(expectedCode, 'the response code received when getting the commits is not expected.')

    const releaseCommit = response.body[0].sha // last commit in the repo is the release commit
    const numberOfTags = expectedTags.length
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
