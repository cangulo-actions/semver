const { parseLastCommit } = require('../../functions/parse-last-commit')

const testData = [
  {
    scenario: 'one commit squashed',
    input: 'fix: #123 solved error querying the payment service (#5)    ',
    output: {
      title: 'fix: #123 solved error querying the payment service (#5)',
      entries: ['fix: #123 solved error querying the payment service (#5)']
    }
  },
  {
    scenario: 'multiple commits squashed',
    input: 'squashed commit title (#8)           \n\n' +
            '* feat(src): #234 added new endpoint for deleting user     \r\n' +
            '* fix(src): #224 INIT 2023-11-03 00:08:46                  \r\n' +
            '* break(src,tfm): #564 updated API endpoints structure     \r\n' +
            '* fix: #123 solved error when querying DB                  \r\n' +
            '* docs(src,tfm): #231 Updated readme for tfm and src       \r\n' +
            '* refactor(tfm): #234 simplified terraform solution        \r\n' +
            '* #2345 Commit that do not follow conventional commits     \r\n' +
            '* line1                                                    \r\n\r\n' +
            '* line2',
    output: {
      title: 'squashed commit title (#8)',
      entries: [
        'feat(src): #234 added new endpoint for deleting user',
        'fix(src): #224 INIT 2023-11-03 00:08:46',
        'break(src,tfm): #564 updated API endpoints structure',
        'fix: #123 solved error when querying DB',
        'docs(src,tfm): #231 Updated readme for tfm and src',
        'refactor(tfm): #234 simplified terraform solution',
        '#2345 Commit that do not follow conventional commits',
        'line1',
        'line2'
      ]
    }
  }
]

describe('Commits are properly parsed', () => {
  testData.forEach(data => {
    it(`scenario: ${data.scenario}\ninput squashed commit:\n\t${data.input}\nis parsed into:\n\t${JSON.stringify(data.output, null, 2)}`,
      () => {
        const release = parseLastCommit(data.input)
        expect(release).toEqual(data.output)
      })
  })
})
