program = require 'commander'
do ->
  program.version('0.0.1')
  .option('-p, --port <n>', 'listen port', parseInt)
  .option('--interval <n>', 'save data interval', parseInt)
  .option('--enableLog <n>', 'enable log')
  .option('--host <n>', 'listen host')
  .option('--uri <n>', 'mongodb uri')
  .parse process.argv

module.exports.port = program.port || 9300

module.exports.host = program.host || '127.0.0.1'

module.exports.enableLog = program.enableLog == 'true'

module.exports.interval = program.interval || 10 * 1000

module.exports.mongodbUri = program.uri
