(function() {
  var program;

  program = require('commander');

  (function() {
    return program.version('0.0.1').option('-p, --port <n>', 'listen port', parseInt).option('--interval <n>', 'save data interval', parseInt).option('--host <n>', 'listen host').option('--uri <n>', 'mongodb uri').parse(process.argv);
  })();

  module.exports.port = program.port || 9300;

  module.exports.host = program.host || '127.0.0.1';

  module.exports.interval = program.interval || 10 * 1000;

  module.exports.mongodbUri = program.uri;

}).call(this);
