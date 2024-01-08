const { Given } = require('@badeball/cypress-cucumber-preprocessor')

Given('if any of the next files exist, they are deleted:', (table) => {
  cy
    .task('getSharedData')
    .then((sharedData) => {
      table
        .rows()
        .forEach(row => {
          const file = row[0]
          const { OWNER, REPO } = sharedData
          cy
            .contentExists({ owner: OWNER, repo: REPO, file })
            .then((exists) => {
              if (exists) {
                cy
                  .getContent({ owner: OWNER, repo: REPO, file })
                  .then((content) => {
                    cy.log(`Deleting file ${content.path}`)
                    cy.deleteContent({ owner: OWNER, repo: REPO, file: content.path, sha: content.sha })
                  })
              }
            })
        })
    })
})

Given('the file {string} is created with the content:', (filePath, fileContent) => {
  const commitMsg = `[skip ci][e2e-background] Create ${filePath}`
  const semverBranchName = Cypress.env('SEMVER_BRANCH')
  const currentTime = new Date().toISOString()

  const content = fileContent
    .replace(/<TARGET_BRANCH>/g, semverBranchName)
    .replace(/<CURRENT_TIME>/g, currentTime)

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy.createContent({ owner: OWNER, repo: REPO, file: filePath, content, commitMsg })
    })
})

Given('I commit {string} modifying the file {string}', (commitMsg, file) => {
  const currentTime = new Date().toISOString()
  const content = `# refresh ${currentTime}`

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy.createContent({ owner: OWNER, repo: REPO, file, content, commitMsg })
    })
})
