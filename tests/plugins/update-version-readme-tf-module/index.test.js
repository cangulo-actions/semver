const plugin = require('../../../plugins/update-version-readme-tf-module')
const core = require('@actions/core')
const fs = require('fs')

jest.mock('@actions/core', () => ({
  info: jest.fn()
  // info: str => console.log(str)
})
)

jest.mock('fs', () => {
  return {
    writeFileSync: jest.fn(),
    readFileSync: jest.fn()
  }
})

describe('build-next-release Happy Paths', () => {
  // arrange
  const fsOriginalModule = jest.requireActual('fs')
  const testFolder = 'tests/plugins/update-version-readme-tf-module'
  const testDataContent = fsOriginalModule.readFileSync(`${testFolder}/test.data.json`)
  const testData = JSON.parse(testDataContent)

  testData
    .filter(x => x.enabled)
    .forEach(data => {
      it(data.scenario, async () => {
        // arrange
        fs.readFileSync = (filePath) => {
          const fileMapped = data.filesMap[filePath]
          const path = `${testFolder}/${fileMapped}`
          return fsOriginalModule.readFileSync(path, 'utf8')
        }
        process.env = data.env

        // act
        await plugin({ core })

        // assert
        const numFilesModified = Object.keys(data.filesModifiedMap).length
        expect(fs.writeFileSync).toHaveBeenCalledTimes(numFilesModified)
        fs.writeFileSync.mock.calls.forEach(([file, content]) => {
          const fileMapped = data.filesModifiedMap[file]
          const path = `${testFolder}/${fileMapped}`
          const expectedContent = fsOriginalModule.readFileSync(path, 'utf8')
          expect(content).toEqual(expectedContent)
        })
      })
    })
  afterEach(() => {
    jest.clearAllMocks()
  })
})
