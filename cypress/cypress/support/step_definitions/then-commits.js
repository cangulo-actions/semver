const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the last commit message must start with {string}', (msgPrefix) => {
  cy
    .getLastCommit()
    .then((lastCommit) => {
      expect(lastCommit.message).to.include(msgPrefix, `the last commit message must start with ${msgPrefix}`)
    })
})
