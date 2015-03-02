'use strict';
var async = require('async');
var request = require('request');
var config = require('./config');
var statsServer = require('./lib/server');

async.waterfall([
  getServers,
  function(serverList, cbf){
    initLog(serverList.log);
    var mongodbAuth = process.env.MONGODB_AUTH;
    var mongodbServer = serverList.mongodb;
    var mongodbUri = mongodbServer.host + ':' + mongodbServer.port;
    console.info('connect to mongodb:%s', mongodbUri);
    if(mongodbAuth){
      mongodbUri = mongodbAuth + '@' + mongodbUri;
    }
    mongodbUri = 'mongodb://' + mongodbUri + '/stats';
    statsServer.start(serverList.stats, mongodbUri);
  }
]);


function getServers(cbf){
  var serverUrl = 'http://jt-service.oss-cn-shenzhen.aliyuncs.com/server.json';
  request.get(serverUrl, function(err, res, data){
    if(err){
      cbf(err);
      return;
    }
    try{
      data = JSON.parse(data);
    }catch(err){
      cbf(err);
      return;
    }
    var serverList = data[config.env] || data.development;
    cbf(null, serverList);
  });
}


/**
 * [initLog 初始化log配置]
 * @param  {[type]} server [description]
 * @return {[type]}        [description]
 */
function initLog(server){
  var jtLogger = require('jtlogger');
  jtLogger.appPath = __dirname + '/';
  if(config.env !== 'development'){
    jtLogger.add(jtLogger.transports.UDP, server);
  }
  jtLogger.add(jtLogger.transports.Console);
  jtLogger.logPrefix = '[' + config.category + ']';
}