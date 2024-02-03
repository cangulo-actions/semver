const { BuildNextRelease } = require('../../functions/build-next-release')
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

describe('build-next-release Happy Paths', () => {
  // arrange
  const originalModule = jest.requireActual('fs')
  const testDataContent = originalModule.readFileSync('tests/functions/build-next-release.test.data.json')
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
        const templates = {
          title: 'templates/changelog-record-title.md',
          body: 'templates/changelog-record-body.md'
        }

        const schemaPath = 'config.schema.yml'
        const schemaContent = fs.readFileSync(schemaPath)
        const schema = yml.load(schemaContent)
        let config = {}

        if (data.configuration) {
          const configPath = data.configuration
          const configContent = fs.readFileSync(configPath)
          config = yml.load(configContent)
        }

        const ajv = new Ajv({ useDefaults: true }) // add default values to the config properties
        const addDefaultValues = ajv.compile(schema)
        addDefaultValues(config)

        // act
        const result = BuildNextRelease(changes, title, config, templates)

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
