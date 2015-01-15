'use strict';
var jtLogger = require('jtlogger');
jtLogger.appPath = __dirname + '/';
var config = require('./config');
var statsServer = require('./lib/server');

statsServer.start({
  port : config.port,
  host : config.host,
  uri : config.mongodbUri
});