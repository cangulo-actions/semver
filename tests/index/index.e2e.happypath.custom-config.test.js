const { Index } = require('../../index')
const core = require('@actions/core')
const fs = require('fs')

jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    startGroup: jest.fn(),
    info: jest.fn(),
    endGroup: jest.fn(),
    setFailed: jest.fn(),
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
        scenario: 'PR with one commit without scopes',
        context: {
            lastCommit: 'fix: #123 solved error querying the payment service (#5)',
            version: '1.2.3',
            files: {
                "version.json": '{\n\t"version": "1.2.3"\n}',
                "CHANGELOG.md": '<previous changelog content>'
            }
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
        scenario: 'PR with multiple commits with 2 scopes',
        context: {
            lastCommit: `squashed commit title with custom config (#9)                     \n\n` +
                `* fix(src): #221 solved DB timeout issue \r\n` +
                `* feat(src): #232 added reporting feature \r\n` +
                `* fix(tfm): #212 increased default DB size`,
            files: {
                "version.json": '{\n\t"version": "0.3.0"\n}',
                "CHANGELOG.md": '<previous changelog content>',
                "src/version.json": '{\n\t"version": "0.1.0"\n}',
                "src/CHANGELOG.md": '<previous changelog content>',
                "terraform/version.json": '{\n\t"version": "1.0.0"\n}',
                "terraform/CHANGELOG.md": '<previous changelog content>'
            }
        },
        outputs: {
            version: '0.4.0',
            "release-required": true,
            "release-title": 'squashed commit title with custom config (#9)',
            "release-type": 'minor',
            changes: [
                {
                    type: 'fix',
                    releaseAssociated: 'patch',
                    scopes: ['src'],
                    description: '#221 solved DB timeout issue',
                    originalCommit: 'fix(src): #221 solved DB timeout issue'
                },
                {
                    type: 'feat',
                    releaseAssociated: 'minor',
                    scopes: ['src'],
                    description: '#232 added reporting feature',
                    originalCommit: 'feat(src): #232 added reporting feature'
                },
                {
                    type: 'fix',
                    releaseAssociated: 'patch',
                    scopes: ['tfm'],
                    description: '#212 increased default DB size',
                    originalCommit: 'fix(tfm): #212 increased default DB size'
                }
            ],
            "changelog-record": `# 0.4.0 squashed commit title with custom config (#9)\n\n` +
                `## new features:\n` +
                `* feat(src): #232 added reporting feature\n` +
                `## patches:\n` +
                `* fix(src): #221 solved DB timeout issue\n` +
                `* fix(tfm): #212 increased default DB size\n`,
            "scopes": {
                "src": {
                    "version": "0.2.0",
                    "releaseType": "minor",
                    "changes": [
                        {
                            type: 'fix',
                            releaseAssociated: 'patch',
                            scopes: ['src'],
                            description: '#221 solved DB timeout issue',
                            originalCommit: 'fix(src): #221 solved DB timeout issue'
                        },
                        {
                            type: 'feat',
                            releaseAssociated: 'minor',
                            scopes: ['src'],
                            description: '#232 added reporting feature',
                            originalCommit: 'feat(src): #232 added reporting feature'
                        }
                    ],
                    "changelog-record": `# 0.2.0 squashed commit title with custom config (#9)\n\n` +
                        `## new features:\n` +
                        `* feat(src): #232 added reporting feature\n` +
                        `## patches:\n` +
                        `* fix(src): #221 solved DB timeout issue\n`
                },
                "tfm": {
                    "version": "1.0.1",
                    "releaseType": "patch",
                    "changes": [
                        {
                            type: 'fix',
                            releaseAssociated: 'patch',
                            scopes: ['tfm'],
                            description: '#212 increased default DB size',
                            originalCommit: 'fix(tfm): #212 increased default DB size'
                        }
                    ],
                    "changelog-record": `# 1.0.1 squashed commit title with custom config (#9)\n\n` +
                        `## patches:\n` +
                        `* fix(tfm): #212 increased default DB size\n`
                }
            }
        },
        filesModified: {
            "version.json": '{\n\t"version": "0.4.0"\n}',
            "CHANGELOG.md": `# 0.4.0 squashed commit title with custom config (#9)\n\n` +
                `## new features:\n` +
                `* feat(src): #232 added reporting feature\n` +
                `## patches:\n` +
                `* fix(src): #221 solved DB timeout issue\n` +
                `* fix(tfm): #212 increased default DB size\n` +
                '\n' +
                '<previous changelog content>',
            "src/version.json": '{\n\t"version": "0.2.0"\n}',
            "src/CHANGELOG.md": `# 0.2.0 squashed commit title with custom config (#9)\n\n` +
                `## new features:\n` +
                `* feat(src): #232 added reporting feature\n` +
                `## patches:\n` +
                `* fix(src): #221 solved DB timeout issue\n` +
                '\n' +
                '<previous changelog content>',
            "terraform/version.json": '{\n\t"version": "1.0.1"\n}',
            "terraform/CHANGELOG.md": `# 1.0.1 squashed commit title with custom config (#9)\n\n` +
                `## patches:\n` +
                `* fix(tfm): #212 increased default DB size\n` +
                '\n' +
                '<previous changelog content>'
        }
    }
]

describe('E2E tests - Happy paths - custom configuration provided', () => {
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

            const originalModule = jest.requireActual('fs')
            const customConfig = JSON.parse(originalModule.readFileSync('tests/index/custom-config.json'))
            fs.readFileSync = (filePath) => data.context.files[filePath] || originalModule.readFileSync(filePath)

            Index(context, core, customConfig)

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
