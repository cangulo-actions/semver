/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Sets the message output', async () => {
    core.getInput.mockImplementation(() => 'Carlos')

    await run()

    expect(core.getInput).toHaveBeenCalledWith('who-to-greet')
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'message', 'Hello Carlos')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('Sets a failed status', async () => {
    core.getInput.mockImplementation(() => {
      throw new Error('Input required and not supplied: who-to-greet')
    })

    await run()

    expect(core.setOutput).not.toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: who-to-greet'
    )
  })
})
