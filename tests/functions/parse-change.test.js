const { parseChange } = require('../../functions/parse-change')
const fs = require('fs')
const yml = require('js-yaml')
const Ajv = require('ajv')

describe('changes are properly parsed', () => {
  const testDataContent = fs.readFileSync('tests/functions/parse-change.test.data.json')
  const testData = JSON.parse(testDataContent)

  const schemaPath = 'config.schema.yml'
  const schemaContent = fs.readFileSync(schemaPath)
  const schema = yml.load(schemaContent)
  const defaultConf = {}
  const ajv = new Ajv({ useDefaults: true }) // add default values to the config properties
  const addDefaultValues = ajv.compile(schema)
  addDefaultValues(defaultConf)

  // arrange
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
