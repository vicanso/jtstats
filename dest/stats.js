(function() {
  var LOG_DATA_DICT, average, config, db, moment, saveData, saveInterval, sum, _;

  _ = require('underscore');

  moment = require('moment');

  db = require('./db');

  config = require('./config');

  saveInterval = config.interval;

  LOG_DATA_DICT = {};

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
    return LOG_DATA_DICT[key].push(data);
  };

  saveData = function(key) {
    var category, collection, createdAt, date, firstItem, infos, list, query, tag, type, value;
    list = LOG_DATA_DICT[key];
    firstItem = _.first(list);
    createdAt = firstItem.createdAt;
    type = firstItem.type;
    date = moment(createdAt);
    infos = key.split('.');
    collection = infos[0];
    category = infos[1];
    tag = infos[2];
    query = {
      date: date.format('YYYY-MM-DD'),
      type: type
    };
    if (category) {
      query.category = category;
    }
    if (tag) {
      query.tag = tag;
    }
    if (firstItem.type === 'average') {
      value = average(_.pluck(list, 'value'));
    } else {
      value = sum(_.pluck(list, 'value'));
    }
    db.findOneAndUpdate(collection, query, {
      '$push': {
        'values': {
          t: createdAt,
          v: value
        }
      }
    });
    LOG_DATA_DICT[key] = [];
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
