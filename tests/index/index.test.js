const { Index } = require('../../index')
const core = require('@actions/core')
const fs = require('fs')

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  startGroup: jest.fn(),
  info: jest.fn(),
  endGroup: jest.fn(),
  setOutput: jest.fn()
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
            `output:\n\t${JSON.stringify(data.outputs, null, 2)}`

      it(testName, () => {
        // arrange

        fs.readFileSync = (filePath) => data.files[filePath] || originalModule.readFileSync(filePath)

        const changes = data.inputs.changes
        const title = data.inputs.title
        const conf = data.configuration === 'custom-config' ? customConfig : defaultConfig

        // act
        Index(core, changes, title, conf)

        // assert
        const numFilesModified = Object.keys(data.filesModified).length
        expect(fs.writeFileSync).toHaveBeenCalledTimes(numFilesModified)
        fs.writeFileSync.mock.calls.forEach(([file, content]) => {
          expect(content).toEqual(data.filesModified[file])
        })

        const numOutputs = Object.keys(data.outputs).length
        expect(core.setOutput).toHaveBeenCalledTimes(numOutputs)
        core.setOutput.mock.calls.forEach(([key, value]) => {
          expect(value).toEqual(data.outputs[key])
        })
      })
    })
  afterEach(() => {
    jest.clearAllMocks()
  })
})
