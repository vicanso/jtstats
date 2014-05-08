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

  module.exports.add = function(data) {
    var firstItem, key, list, now;
    now = Date.now();
    data.createdAt = now;
    key = data.key;
    if (!LOG_DATA_DICT[key]) {
      LOG_DATA_DICT[key] = [];
    }
    list = LOG_DATA_DICT[key];
    firstItem = _.first(list);
    if (firstItem && firstItem.createdAt + saveInterval < now) {
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
    var collection, createdAt, date, firstItem, i, info, infos, list, query, type, value, _i, _len;
    list = LOG_DATA_DICT[key];
    firstItem = _.first(list);
    createdAt = firstItem.createdAt;
    type = firstItem.type;
    date = new Date(createdAt);
    infos = key.split('.');
    collection = infos.shift();
    query = {
      date: formatDate(date),
      type: type,
      tag: infos.join('.')
    };
    for (i = _i = 0, _len = infos.length; _i < _len; i = ++_i) {
      info = infos[i];
      query["category" + i] = info;
    }
    if (firstItem.type === 'average') {
      value = average(_.pluck(list, 'value'));
    } else if (firstItem.type === 'gauge') {
      value = _.last(list).value;
    } else {
      value = sum(_.pluck(list, 'value'));
    }
    db.findOneAndUpdate(collection, query, {
      '$push': {
        'values': {
          t: Math.floor(createdAt / 1000),
          v: value
        }
      }
    });
    LOG_DATA_DICT[key] = [];
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
