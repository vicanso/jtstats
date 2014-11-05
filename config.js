'use strict';
var program = require('commander');

program.version('0.0.1')
  .option('-p, --port <n>', 'listen port', parseInt)
  .option('--interval <n>', 'save data interval', parseInt)
  .option('--enableLog <n>', 'enable log')
  .option('--host <n>', 'listen host')
  .option('--uri <n>', 'mongodb uri')
  .parse(process.argv);

exports.port = program.port || 6000;

exports.host = program.host || '127.0.0.1';

exports.enableLog = program.enableLog === 'true';

exports.interval = program.interval || 10 * 1000;

exports.mongodbUri = program.uri;