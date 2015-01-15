'use strict';
var dgram = require('dgram');
var db = require('./db');
var stats = require('./stats');
var _ = require('underscore');
var util = require('util');
var schedule = require('node-schedule');
var DEBUG = !_.isUndefined(process.env.DEBUG);

/**
 * [startMonitor 开始监控node lag]
 * @return {[type]} [description]
 */
var startMonitor = function(){
  var lagTotal = 0;
  var lagCount = 0;
  var toobusy = null;
  try{
    toobusy = require('toobusy');
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
    }
    var timer = setTimeout(lagLog, 1000);
    timer.unref();
  };
  lagLog();
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
 * @return {[type]}         [description]
 */
exports.start = function(options){
  if(!options){
    throw new Error('options can not be null');
  }
  if(!options.uri){
    throw new Error('the mongodb uri is undefined');
  }
  var server = dgram.createSocket('udp4');
  server.on('listening', function(){
    var address = server.address();
    console.log(util.format('udp server listening on %s:%d', address.address, address.port));
  });

  server.on('message', function(msg){
    msg = msg.toString();
    if(DEBUG){
      console.log(msg);
    }
    stats.add(msg);
  });


  db.initConnection(options.uri);

  server.bind(options.port, options.host || '127.0.0.1');
  
  startMonitor();
  setSchedule();
};