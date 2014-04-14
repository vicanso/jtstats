(function() {
  var config, jtStats;

  config = require('./config');

  jtStats = require('./index');

  jtStats.start({
    port: config.port,
    host: config.host,
    interval: config.interval,
    uri: config.mongodbUri
  });

}).call(this);
