'use strict';
var config = require('./config');
var statsServer = require('./lib/server');

statsServer.start({
  port : config.port,
  host : config.host,
  interval : config.interval,
  uri : config.mongodbUri,
  enableLog : config.enableLog
});