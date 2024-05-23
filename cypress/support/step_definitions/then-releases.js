const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the repository must have {string} gh release', (numberOfGHReleases) => {
  const expectedNumberOfGHReleases = parseInt(numberOfGHReleases)
  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy
        .getGHReleases({ owner: OWNER, repo: REPO })
        .then((releases) => {
          expect(releases.length).to.equal(expectedNumberOfGHReleases)

          const releasesMapped = releases.map((release) => {
            return {
              tag_name: release.tag_name,
              name: release.name,
              body: release.body
            }
          })
          const releasesJSON = JSON.stringify(releasesMapped)
          cy.task('appendSharedData', `GH_RELEASES=${releasesJSON}`)
        })
    })
})

Then('the only gh release must have the tag {string}', (tag) => {
  cy
    .task('getSharedDataByKey', 'GH_RELEASES')
    .then((ghReleases) => {
      cy.log(`GH Releases: ${ghReleases}`)
      const releases = JSON.parse(ghReleases)
      cy.log(`Releases: ${JSON.stringify(releases)}`)
      expect(releases.length).to.equal(1)
      expect(releases[0].tag_name).to.equal(tag)
    })
})

Then('the only gh release must have the title {string}', (tag) => {
  cy
    .task('getSharedDataByKey', 'GH_RELEASES')
    .then((ghReleases) => {
      const releases = JSON.parse(ghReleases)
      expect(releases.length).to.equal(1)
      expect(releases[0].name).to.equal(tag)
    })
})

Then('the only gh release must have the body:', (body) => {
  cy
    .task('getSharedDataByKey', 'GH_RELEASES')
    .then((ghReleases) => {
      const releases = JSON.parse(ghReleases)
      expect(releases.length).to.equal(1)
      expect(releases[0].body).to.equal(body)
    })
})

Then('the gh releases are:', (tables) => {
  cy
    .task('getSharedDataByKey', 'GH_RELEASES')
    .then((ghReleases) => {
      const releases = JSON.parse(ghReleases).map(({ tag_name: tag, name }) => ({ tag, name }))
      const expectedReleases = tables.rows().map(([name, tag]) => ({ name, tag }))
      expect(releases.length).to.equal(expectedReleases.length, 'Number of releases does not match')
      expectedReleases.forEach(expectedRelease => {
        const matchExists = releases.some(release => release.tag === expectedRelease.tag && release.name === expectedRelease.name)
        expect(matchExists).to.equal(true, `Release ${JSON.stringify(expectedRelease)} not found`)
      })
    })
})
