'use strict';
var _ = require('lodash');
var db = require('./db');
var interval = 10 * 1000;
var LOG_DATA_DICT = {};
var async = require('async');
var util = require('util');
var oneDaySeconds = 24 * 3600;

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
  LOG_DATA_DICT[key].push(data);
};



/**
 * [arrange 将数据整理（合并相同数据，生成minutes tenMinutes字段）]
 * @param {[type]} cbf
 * @return {[type]}            [description]
 */
exports.arrange = function(arrangeDate, cbf){
  /**
   * [arrangeByCollection 对collection的数据做整理]
   * @param  {[type]} collection [description]
   * @param  {[type]} cbf        [description]
   * @return {[type]}            [description]
   */
  var arrangeByCollection = function(collection, cbf){
    var date = formatDate(arrangeDate);
    async.waterfall([
      function(cbf){
        var Model = db.model(collection);
        Model.find({date : date, seconds : {'$exists' : false}}, '_id', cbf);
      },
      function(ids, cbf){
        async.eachLimit(ids, 1, function(id, cbf){
          arrangeById(collection, id, cbf);
        }, cbf);
      }
    ], function(err){
      if(err){
        console.error('arrangeByCollection fail:' + err.message);
      }
      cbf(null);
    });
  };

  /**
   * [formatData 按间隔重新整理数据]
   * @param  {[type]} doc     [description]
   * @return {[type]}          [description]
   */
  var formatData = function(doc){
    var type = doc.type;
    var data = doc.data;
    var result = {};
    if(!data || !data.length){
      return result;
    }
    var seconds = [];
    var minutes = [];
    var tenMinutes = [];
    var hours = [];

    var convertOptions = [
      {
        name : 'seconds',
        interval : 1,
        data : []
      },
      {
        name : 'minutes',
        interval : 60,
        data : []
      },
      {
        name : 'tenMinutes',
        interval : 600,
        data : []
      },
      {
        name : 'hours',
        interval : 3600,
        data : []
      }
    ];
    _.forEach(data, function(item){
      var arr = item.split(':');
      var index = parseInt(arr[0], 32);
      var value = parseFloat(arr[1]);
      _.forEach(convertOptions, function(option){
        var tmpIndex = Math.floor(index / option.interval);
        if(!option.data[tmpIndex]){
          option.data[tmpIndex] = [];
        }
        option.data[tmpIndex].push(value);
      });
    });
    _.forEach(convertOptions, function(option){
      _.forEach(option.data, function(arr, i){
        if(!arr){
          return;
        }
        var value;
        switch(type){
          case 'average':
            value = average(arr);
          break;
          case 'gauge':
            value = _.last(arr);
          break;
          default:
            value = sum(arr);
          break;
        }
        option.data[i] = value;
      });
      result[option.name] = option.data;
    });
    return result;
  };

  /**
   * [arrangeById 通过id获取某记录整理数据]
   * @param  {[type]} collection [description]
   * @param  {[type]} id         [description]
   * @param  {[type]} cbf        [description]
   * @return {[type]}            [description]
   */
  var arrangeById = function(collection, id, cbf){
    async.waterfall([
      function(cbf){
        var Model = db.model(collection);
        Model.findById(id, cbf);
      },
      function(doc, cbf){
        doc = doc.toObject();
        var result = formatData(doc);
        updateQueue.push({
          collection : collection,
          conditions : {
            '_id' : id
          },
          update : {
            '$set' : result,
            '$unset' : {
              data : ''
            }
          }
        }, cbf);
      }
    ], cbf);
  };

  async.waterfall([
    function(cbf){
      db.getCollectionNames(function(err, names){
        if(err){
          return cbf(err);
        }else{
          cbf(null, _.filter(names, function(name){
            return !~name.indexOf('stats_');
          }));
        }
      });
    },
    function(collections, cbf){
      async.eachLimit(collections, 1, arrangeByCollection, cbf);
    }
  ], function(err){
    if(err){
      console.error('arrange fail:' + err.message);
    }
    cbf(null);
  });
};


var updateQueue = async.queue(function(task, cbf){
  db.update(task.collection, task.conditions, task.update, cbf);
}, 20);

/**
 * [updateCbf 更新的回调函数（主要log error）]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var updateCbf = function(err, numberAffected){
  if(err){
    console.error(err.message);
  }
};

var update = function(collection, conditions, data){
  if(!~collection.indexOf('stats_')){
    updateQueue.push({
      collection : collection,
      conditions : conditions,
      update : {
        '$push' : {
          'data' : {
            '$each' : data
          }
        }
      }
    }, updateCbf);
    var runningCount = updateQueue.running();
    if(runningCount){
      console.log('update queue running count:%d', runningCount);
    }
    
  }
};

/**
 * [saveData 保存数据到数据库]
 * @param  {[type]} list [description]
 * @return {[type]}     [description]
 */
var saveData = function(list){
  // var list = LOG_DATA_DICT[key];

  // LOG_DATA_DICT[key] = [];

  var firstItem = _.first(list);
  var collection = firstItem.category;
  var type = firstItem.type;
  var date = new Date(firstItem.createdAt);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  var dateMs = date.getTime();
  var todayResult = {};
  var nextDayResult = {};
  var mergeValues = function(type, values){
    var value = 0;
    switch(type){
      case 'average':
        value = average(values);
      break;
      case 'gauge':
        value = _.last(values);
      break;
      default:
        value = sum(values);
      break;
    }
    return value;
  };
  _.forEach(list, function(item){
    var seconds = Math.floor((item.createdAt - dateMs) / 1000);
    var key = '';
    if(seconds < oneDaySeconds){
      key = seconds.toString(32);
      if(!todayResult[key]){
        todayResult[key] = [];
      }
      todayResult[key].push(item.value);
    }else{
      key = (seconds - oneDaySeconds).toString(32);
      if(!nextDayResult[key]){
        nextDayResult[key] = [];
      }
      nextDayResult[key].push(item.value);
    }
  });
  var todayUpdateData = [];
  _.forEach(todayResult, function(values, key){
    var v = mergeValues(type, values);
    if(!_.isNaN(v)){
      todayUpdateData.push(key + ':' + v);
    }
  });
  var nextDayUpdateData = [];
  _.forEach(nextDayResult, function(values, key){
    var v = mergeValues(type, values);
    if(!_.isNaN(v)){
      nextDayUpdateData.push(key + ':' + v);
    }
  });
  if(todayUpdateData.length){
    update(collection, {
      type : firstItem.type, 
      key : firstItem.key, 
      date : formatDate(date)
    }, todayUpdateData);
  }
  if(nextDayUpdateData.length){
    date = new Date(dateMs + oneDaySeconds * 1000);
    update(collection, {
      type : firstItem.type, 
      key : firstItem.key, 
      date : formatDate(date)
    }, nextDayUpdateData);
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
  if(!data || !data.length){
    return 0;
  }
  return _.reduce(data, function(memo, num){
    return memo + num;
  }, 0);
};

var average = function(data){
  if(!data || !data.length){
    return 0;
  }
  var total = sum(data);
  return Math.round(total / data.length);
};



var doSaveStats = function(){
  _.forEach(LOG_DATA_DICT, function(list, key){
    if(list && list.length){
      saveData(list);
      LOG_DATA_DICT[key] = [];
    }
  });
  _.delay(doSaveStats, interval);
};

_.delay(doSaveStats, interval);


