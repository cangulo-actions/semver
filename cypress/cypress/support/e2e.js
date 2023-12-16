const consoleReporter = require('cypress-terminal-report/src/installLogsCollector')

consoleReporter()

// commands
require('cypress-wait-until')
require('./commands/gh-api-commits')
require('./commands/gh-api-releases')
require('./commands/gh-api-workflows')
