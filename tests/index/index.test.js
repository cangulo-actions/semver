const { Index } = require('../../index')
const fs = require('fs')
const yaml = require('js-yaml')

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
  const testScenarios = testData.scenarios

  const defaultConfigContent = originalModule.readFileSync('default-config.yml')
  const defaultConfig = yaml.load(defaultConfigContent)
  const customConfig = testData['custom-config']
  process.env.CHANGELOG_RECORD_TEMPLATE = 'templates/changelog-record.md'

  testScenarios
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario, () => {
        // arrange
        fs.readFileSync = (filePath) => data.files[filePath] || originalModule.readFileSync(filePath)

        const changes = data.inputs.changes
        const title = data.inputs.title
        const conf = data.configuration === 'custom-config' ? customConfig : defaultConfig

        // act
        const result = Index(changes, title, conf)

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
