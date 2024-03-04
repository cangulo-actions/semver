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
                  .then((response) => {
                    cy.log(`Deleting file ${response.path}`)
                    cy.deleteContent({ owner: OWNER, repo: REPO, file: response.path, sha: response.sha })
                  })
              }
            })
        })
    })
})

Given('I push the file {string} to the branch {string} with the content:', (file, branch, fileContent) => {
  const commitMsg = `[skip ci][e2e-background] Create ${file}`
  const semverBranchName = Cypress.env('SEMVER_BRANCH')
  const content = fileContent.replace(/<TARGET_BRANCH>/g, semverBranchName)

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO } = sharedData
      cy.createContent({ owner: OWNER, repo: REPO, file, content, commitMsg, branch })
    })
})

Given('I commit {string} modifying the file {string}', (commitMsg, file) => {
  const currentTime = new Date().toISOString()
  const content = `# refresh ${currentTime}`

  cy
    .task('getSharedData')
    .then((sharedData) => {
      const { OWNER, REPO, BRANCH } = sharedData
      cy.createContent({ owner: OWNER, repo: REPO, file, content, commitMsg, branch: BRANCH })
    })
})
