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
    const originalModule = jest.requireActual('fs')
    return {
        __esModule: true,
        ...originalModule,
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(),
        existsSync: (filePath) => true
    }
})

const testData = [
    {
        enabled: true,
        scenario: 'PR with one commit',
        context: {
            lastCommit: 'fix: #123 solved error querying the payment service (#5)',
            version: '1.2.3',
            changelogContent: '<previous changelog content>'
        },
        outputs: {
            version: '1.2.4',
            "release-required": true,
            "release-title": 'fix: #123 solved error querying the payment service (#5)',
            "release-type": 'patch',
            changes: [
                {
                    type: 'fix',
                    releaseAssociated: 'patch',
                    scopes: [],
                    description: '#123 solved error querying the payment service (#5)',
                    originalCommit: 'fix: #123 solved error querying the payment service (#5)'
                }
            ],
            "changelog-record": `# 1.2.4 fix: #123 solved error querying the payment service (#5)\n\n` +
                `## patches:\n` +
                `* fix: #123 solved error querying the payment service (#5)\n`
        },
        filesModified: {
            "version.json": '{\n\t"version": "1.2.4"\n}',
            "CHANGELOG.md": '# 1.2.4 fix: #123 solved error querying the payment service (#5)\n\n' +
                '## patches:\n' +
                '* fix: #123 solved error querying the payment service (#5)\n' +
                '\n' +
                '<previous changelog content>'
        }
    },
    {
        enabled: true,
        scenario: 'PR with multiple commits',
        context: {
            lastCommit: `squashed commit title (#8)                     \n\n` +
                `* feat(src): #234 added new endpoint for deleting user \r\n` +
                `* fix: #224 solved error handling invalid account id`,
            version: '0.0.0',
            changelogContent: '<previous changelog content>'
        },
        outputs: {
            version: '0.1.0',
            "release-required": true,
            "release-title": 'squashed commit title (#8)',
            "release-type": 'minor',
            changes: [
                {
                    type: 'feat',
                    releaseAssociated: 'minor',
                    scopes: ['src'],
                    description: '#234 added new endpoint for deleting user',
                    originalCommit: 'feat(src): #234 added new endpoint for deleting user'
                },
                {
                    type: 'fix',
                    releaseAssociated: 'patch',
                    scopes: [],
                    description: '#224 solved error handling invalid account id',
                    originalCommit: 'fix: #224 solved error handling invalid account id'
                }
            ],
            "changelog-record": `# 0.1.0 squashed commit title (#8)\n\n` +
                `## new features:\n` +
                `* feat(src): #234 added new endpoint for deleting user\n` +
                `## patches:\n` +
                `* fix: #224 solved error handling invalid account id\n`

        },
        filesModified: {
            "version.json": '{\n\t"version": "0.1.0"\n}',
            "CHANGELOG.md": `# 0.1.0 squashed commit title (#8)\n\n` +
                `## new features:\n` +
                `* feat(src): #234 added new endpoint for deleting user\n` +
                `## patches:\n` +
                `* fix: #224 solved error handling invalid account id\n` +
                '\n' +
                '<previous changelog content>'
        }
    }
]

describe('E2E tests - Happy paths - no configuration provided', () => {
    const originalModule = jest.requireActual('fs')
    testData.filter(x => x.enabled).forEach(data => {
        const testName = `${data.scenario}\n` +
            `context:\n\t${JSON.stringify(data.context, null, 2)}\n` +
            `output:\n\t${JSON.stringify(data.outputs, null, 2)}`
        it(testName, () => {
            process.env.CHANGELOG_RECORD_TEMPLATE = 'templates/changelog-record.md'
            const context = {
                payload: {
                    commits: [{ message: data.context.lastCommit }]
                }
            }

            fs.readFileSync = (filePath) => {
                switch (filePath) {
                    case 'version.json':
                        return `{ "version": "${data.context.version}" }`
                    case 'CHANGELOG.md':
                        return data.context.changelogContent
                    default:
                        return originalModule.readFileSync(filePath)
                }
            }

            const conf = JSON.parse(originalModule.readFileSync('default-config.json'))
            Index(context, core, conf)

            const numFilesModified = Object.keys(data.filesModified).length;
            expect(fs.writeFileSync).toHaveBeenCalledTimes(numFilesModified);
            fs.writeFileSync.mock.calls.forEach(([file, content]) => {
                expect(content).toEqual(data.filesModified[file]);
            });

            const numOutputs = Object.keys(data.outputs).length;
            expect(core.setOutput).toHaveBeenCalledTimes(numOutputs);
            core.setOutput.mock.calls.forEach(([key, value]) => {
                expect(value).toEqual(data.outputs[key]);
            });
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
})
