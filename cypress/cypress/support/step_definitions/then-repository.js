const { Then } = require('@badeball/cypress-cucumber-preprocessor')

Then('the repository must have the tag {string}', (tag) => {
  cy
    .getTags()
    .then((tags) => {
      expect(tags).to.include(tag, `the repository must have the tag ${tag}`)
    })
})
