const { parseChange } = require('../../functions/parse-change')
const fs = require('fs')
const yaml = require('js-yaml')

describe('changes are properly parsed', () => {
  const testDataContent = fs.readFileSync('tests/functions/parse-change.test.data.json')
  const testData = JSON.parse(testDataContent)

  // arrange
  const defaultConfigContent = fs.readFileSync('config.default.yml')
  const defaultConf = yaml.load(defaultConfigContent)
  const commitsConfig = defaultConf.commits

  testData
    .filter(data => data.enabled)
    .forEach(data => {
      it(`${data.scenario}`,
        () => {
          // act
          const change = parseChange(data.input, commitsConfig)
          // assert
          expect(change).toEqual(data.output)
        })
    })
})
