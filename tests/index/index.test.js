const { Index } = require('../../index')
const fs = require('fs')
const yml = require('js-yaml')
const Ajv = require('ajv')

jest.mock('fs', () => {
  return {
    writeFileSync: jest.fn(),
    readFileSync: jest.fn(),
    existsSync: (filePath) => true
  }
})

describe('index.js Happy Paths', () => {
  // arrange
  const originalModule = jest.requireActual('fs')
  const testDataContent = originalModule.readFileSync('tests/index/index.test.data.json')
  const testData = JSON.parse(testDataContent)

  process.env.CHANGELOG_RECORD_TEMPLATE = 'templates/changelog-record.md'

  testData
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario, () => {
        // arrange
        fs.readFileSync = (filePath) => data.files[filePath] || originalModule.readFileSync(filePath)

        const changes = data.inputs.changes
        const title = data.inputs.title

        const configPath = data.configuration || 'config.default.yml'
        const schemaPath = 'config.schema.yml'

        const schemaContent = fs.readFileSync(schemaPath)
        const configContent = fs.readFileSync(configPath)
        const schema = yml.load(schemaContent)
        const config = yml.load(configContent)

        const ajv = new Ajv({ useDefaults: true })
        const validate = ajv.compile(schema)
        validate(config) // add default values to the config properties

        // act
        const result = Index(changes, title, config)

        // assert
        const numFilesModified = Object.keys(data.filesModified).length
        expect(fs.writeFileSync).toHaveBeenCalledTimes(numFilesModified)
        fs.writeFileSync.mock.calls.forEach(([file, content]) => {
          expect(content).toEqual(data.filesModified[file])
        })

        const numOutputsExpected = Object.keys(data.result).length
        const numOutputs = Object.keys(result).length
        expect(numOutputs).toEqual(numOutputsExpected)
        for (const [key, value] of Object.entries(result)) {
          expect(value).toEqual(data.result[key])
        }
      })
    })
  afterEach(() => {
    jest.clearAllMocks()
  })
})
