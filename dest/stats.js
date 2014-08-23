(function() {
  var LOG_DATA_DICT, average, db, formatDate, saveData, saveInterval, sum, _;

  _ = require('underscore');

  db = require('./db');

  saveInterval = 10 * 1000;

  LOG_DATA_DICT = {};


  /**
   * [add 添加统计]
   * @param {[type]} data
   */

  module.exports.add = function(msg) {
    var arr, createdAt, data, firstItem, key, list;
    arr = msg.split('|');
    createdAt = GLOBAL.parseInt(arr[4]);
    data = {
      category: arr[0],
      key: arr[1],
      type: arr[2],
      value: GLOBAL.parseFloat(arr[3]),
      createdAt: createdAt
    };
    key = "" + data.category + data.key;
    if (!LOG_DATA_DICT[key]) {
      LOG_DATA_DICT[key] = [];
    }
    list = LOG_DATA_DICT[key];
    firstItem = _.first(list);
    if ((firstItem != null ? firstItem.createdAt : void 0) + saveInterval < createdAt) {
      saveData(key);
    }
    LOG_DATA_DICT[key].push(data);
  };


  /**
   * [setInterval 设置保存数据的时间间隔（默认为10s）]
   * @param {[type]} value
   */

  module.exports.setInterval = function(value) {
    if (value && value > 0) {
      saveInterval = value;
    }
  };


  /**
   * [saveData 保存数据]
   * @param  {[type]} key
   * @return {[type]}
   */

  saveData = function(key) {
    var collection, createdAt, date, lastItem, list, pushValue, query, t, type, value;
    list = LOG_DATA_DICT[key];
    LOG_DATA_DICT[key] = [];
    lastItem = _.last(list);
    createdAt = lastItem.createdAt;
    type = lastItem.type;
    date = new Date(createdAt);
    collection = lastItem.category;
    query = {
      date: formatDate(date),
      type: type,
      key: lastItem.key
    };
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    if (lastItem.type === 'average') {
      value = average(_.pluck(list, 'value'));
    } else if (lastItem.type === 'gauge') {
      value = _.last(list).value;
    } else {
      value = sum(_.pluck(list, 'value'));
    }
    pushValue = {};
    t = Math.floor((createdAt - date.getTime()) / 1000);
    pushValue[t] = value;
    if (!~collection.indexOf('stats_')) {
      db.findOneAndUpdate(collection, query, {
        '$push': {
          'values': pushValue
        }
      });
    }
  };

  formatDate = function(date) {
    var day, month, str;
    str = date.getFullYear();
    month = date.getMonth() + 1;
    str += '-';
    if (month < 10) {
      str += "0" + month;
    } else {
      str += month;
    }
    day = date.getDate();
    str += '-';
    if (day < 10) {
      return str += "0" + day;
    } else {
      return str += day;
    }
  };

  sum = function(data) {
    return _.reduce(data, function(memo, num) {
      return memo + num;
    }, 0);
  };

  average = function(data) {
    var total;
    total = sum(data);
    return Math.round(total / data.length);
  };

}).call(this);
