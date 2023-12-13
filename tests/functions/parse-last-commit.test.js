const { parseLastCommit } = require('../../functions/parse-last-commit')
const fs = require('fs')

describe('Commits are properly parsed', () => {
  const testDataContent = fs.readFileSync('tests/functions/parse-last-commit.test.data.json')
  const testData = JSON.parse(testDataContent)

  testData.forEach(data => {
    it(`scenario: ${data.scenario}\ninput squashed commit:\n\t${data.input}\nis parsed into:\n\t${JSON.stringify(data.output, null, 2)}`,
      () => {
        const release = parseLastCommit(data.input)
        expect(release).toEqual(data.output)
      })
  })
})
