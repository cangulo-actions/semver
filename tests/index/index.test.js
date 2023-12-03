const { Index } = require('../../index')
const core = require('@actions/core')
const fs = require('fs')

jest.mock('@actions/core', () => ({
  startGroup: jest.fn(),
  endGroup: jest.fn()
}))

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

  const defaultConfigContent = originalModule.readFileSync('default-config.json')
  const defaultConfig = JSON.parse(defaultConfigContent)
  const customConfig = testData['custom-config']
  process.env.CHANGELOG_RECORD_TEMPLATE = 'templates/changelog-record.md'

  testScenarios
    .filter(x => x.enabled)
    .forEach(data => {
      const testName = `${data.scenario}\n` +
            `inputs:\n\t${JSON.stringify(data.inputs, null, 2)}\n` +
            `result:\n\t${JSON.stringify(data.result, null, 2)}`

      it(testName, () => {
        // arrange

        fs.readFileSync = (filePath) => data.files[filePath] || originalModule.readFileSync(filePath)

        const changes = data.inputs.changes
        const title = data.inputs.title
        const conf = data.configuration === 'custom-config' ? customConfig : defaultConfig

        // act
        const result = Index(core, changes, title, conf)

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
