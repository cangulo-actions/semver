const consoleReporter = require('cypress-terminal-report/src/installLogsCollector')

consoleReporter()

// commands
require('./commands/gh-api-commits')
require('./commands/gh-api-releases')
