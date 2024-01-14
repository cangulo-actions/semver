const { parseLastCommit } = require('../../functions/parse-last-commit')
const fs = require('fs')

describe('Commits are properly parsed', () => {
  const testDataContent = fs.readFileSync('tests/functions/parse-last-commit.test.data.json')
  const testData = JSON.parse(testDataContent)

  testData
    .filter(data => data.enabled)
    .forEach(data => {
      it(`scenario: ${data.scenario}\ninput squashed commit:\n\t${data.input}\nis parsed into:\n\t${JSON.stringify(data.output, null, 2)}`,
        () => {
          // act
          const release = parseLastCommit(data.input)
          // assert
          expect(release).toEqual(data.output)
        })
    })
})
