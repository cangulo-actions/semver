const { parseChange } = require('../../functions/parse-change')
const fs = require('fs')
const yaml = require('js-yaml')

describe('changes are properly parsed', () => {
  const testDataContent = fs.readFileSync('tests/functions/parse-change.test.data.json')
  const testData = JSON.parse(testDataContent)

  testData.forEach(data => {
    it(`change:\n\t${data.input}\nis parsed into:\n\t${JSON.stringify(data.output, null, 2)}`,
      () => {
        const defaultConfigContent = fs.readFileSync('default-config.yml')
        const defaultConf = yaml.load(defaultConfigContent)
        const commitsConfig = defaultConf.commits
        const change = parseChange(data.input, commitsConfig)
        expect(change).toEqual(data.output)
      })
  })
})
