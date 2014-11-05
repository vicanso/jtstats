'use strict';
var _ = require('underscore');
var db = require('./db');
var saveInterval = 10 * 1000;
var LOG_DATA_DICT = {};
var async = require('async');
var util = require('util');

/**
 * [add 添加统计]
 * @param {[type]} msg [description]
 */
exports.add = function(msg){
  var arr = msg.split('|');
  var createdAt = GLOBAL.parseInt(arr[4]);
  var data = {
    category : arr[0],
    key : arr[1],
    type : arr[2],
    value : GLOBAL.parseFloat(arr[3]),
    createdAt : createdAt
  };
  var key = data.category + data.key;
  if(!LOG_DATA_DICT[key]){
    LOG_DATA_DICT[key] = [];
  }
  var list = LOG_DATA_DICT[key];
  var firstItem = _.first(list);
  if(firstItem && firstItem.createdAt + saveInterval < createdAt){
    saveData(key);
  }
  LOG_DATA_DICT[key].push(data);
};

/**
 * [setInterval 设置保存数据的时间间隔（默认为10s）]
 * @param {[type]} value [description]
 */
exports.setInterval = function(value){
  if(_.isNaN(value)){
    return;
  }
  if(value && value > 0){
    saveInterval = value;
  }
};


var updateQueue = async.queue(function(task, cbf){
  db.update(task.collection, task.conditions, task.update, cbf);
}, 10);

/**
 * [updateCbf 更新的回调函数（主要log error）]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var updateCbf = function(err){
  if(err){
    console.error(err.message);
  }
};

/**
 * [saveData 保存数据到数据库]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
var saveData = function(key){
  var list = LOG_DATA_DICT[key];
  LOG_DATA_DICT[key] = [];
  var lastItem = _.last(list);
  var createdAt = lastItem.createdAt;
  var type = lastItem.type;
  var date = new Date(createdAt);
  var collection = lastItem.category;
  var conditions = {
    date : formatDate(date),
    type : type,
    key : lastItem.key
  };
  var value = null;
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  switch(lastItem.type){
    case 'average':
      value = average(_.pluck(list, 'value'));
    break;
    case 'gauge':
      value = _.last(list).value;
    break;
    default:
      value = sum(_.pluck(list, value));
    break;
  }
  if(_.isNaN(value)){
    return;
  }
  var pushValue = {};
  var t = Math.floor((createdAt - date.getTime()) / 1000);
  pushValue[t] = value;
  if(!~collection.indexOf('stats_')){
    updateQueue.push({
      collection : collection,
      conditions : conditions,
      update : {
        '$push' : {
          'values' : pushValue
        }
      }
    }, updateCbf);
    console.log(util.format('update queue running count:%d', updateQueue.running()));
  }
};


var formatDate = function(date){
  var str = date.getFullYear();
  var month = date.getMonth() + 1;
  str += '-';
  if(month < 10){
    str += ('0' + month);
  }else{
    str += month;
  }

  var day = date.getDate();
  str += '-';
  if(day < 10){
    str += ('0' + day);
  }else{
    str += day;
  }
  return str;
};

var sum = function(data){
  return _.reduce(data, function(memo, num){
    return memo + num;
  }, 0);
};

var average = function(data){
  var total = sum(data);
  return Math.round(total / data.length);
};









