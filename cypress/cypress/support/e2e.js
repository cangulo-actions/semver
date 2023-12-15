const consoleReporter = require('cypress-terminal-report/src/installLogsCollector')
require('./commands')

consoleReporter()
