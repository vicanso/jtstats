'use strict';
var dgram = require('dgram');
var db = require('./db');
var stats = require('./stats');
var _ = require('lodash');
var util = require('util');
var schedule = require('node-schedule');
var bytes = require('bytes');
var debug = require('debug')('jt.stats');
/**
 * [startMonitor 开始监控node lag]
 * @return {[type]} [description]
 */
var startMonitor = function(){
  var lagTotal = 0;
  var lagCount = 0;
  var toobusy = null;
  try{
    toobusy = require('toobusy-js');
  }catch(err){
    toobusy = null;
  }
  if(!toobusy){
    return;
  }

  var lagLog = function(){
    lagTotal += toobusy.lag();
    lagCount++;
    if(lagCount === 10){
      var lag = Math.ceil(lagTotal / lagCount);
      lagCount = 0;
      lagTotal = 0;
      console.log('lag:' + lag);
      memoryLog();
    }
    var timer = setTimeout(lagLog, 1000);
    timer.unref();
  };
  lagLog();
};



var memoryLog = function(interval){
  var memoryUsage = process.memoryUsage();
  var rss = bytes(memoryUsage.rss);
  var heapTotal = bytes(memoryUsage.heapTotal);
  var heapUsed = bytes(memoryUsage.heapUsed);
  
  console.info('memory.rss.%s', rss);
  console.info('memory.heapTotal.%s', heapTotal);
  console.info('memory.heapUsed.%s', heapUsed);
};

/**
 * [setSchedule description]
 */
var setSchedule = function(){
  var rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 1;
  schedule.scheduleJob(rule, function(){
    var date = new Date(Date.now() - 30 * 60 * 1000);
    stats.arrange(date, function(){
      setTimeout(function(){
        stats.arrange(date, function(){
        });
      }, 10 * 1000);
    });
  });
};

/**
 * [start 启动jtstas]
 * @param  {[type]} options [description]
 * @param  {[type]} mongodbUri [description]
 * @return {[type]}         [description]
 */
exports.start = function(options, mongodbUri){
  if(!options){
    throw new Error('options can not be null');
  }
  if(!mongodbUri){
    throw new Error('the mongodb uri is undefined');
  }
  var server = dgram.createSocket('udp4');
  server.on('listening', function(){
    var address = server.address();
    console.log(util.format('udp server listening on %s:%d', address.address, address.port));
  });

  server.on('message', function(msg){
    msg = msg.toString();
    debug('message:%s', msg);
    stats.add(msg);
  });


  db.initConnection(mongodbUri);

  server.bind(options.port, options.host || '127.0.0.1');
  
  startMonitor();
  setSchedule();
};