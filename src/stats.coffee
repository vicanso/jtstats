_ = require 'underscore'
moment = require 'moment'
db = require './db'
config = require './config'
saveInterval = config.interval
LOG_DATA_DICT = {}

module.exports.add = (data) ->
  now = Date.now()
  data.createdAt = now
  key = data.key
  if !LOG_DATA_DICT[key]
    LOG_DATA_DICT[key] = []
  list = LOG_DATA_DICT[key]
  firstItem = _.first list
  saveData key if firstItem && firstItem.createdAt + saveInterval < now

  LOG_DATA_DICT[key].push data

saveData = (key) ->
  list = LOG_DATA_DICT[key]
  firstItem = _.first list
  createdAt = firstItem.createdAt
  type = firstItem.type
  date = moment createdAt
  infos = key.split '.'
  collection = infos[0]
  category = infos[1]
  tag = infos[2]
  query = 
    date : date.format 'YYYY-MM-DD'
    type : type
  query.category = category if category
  query.tag = tag if tag

  if firstItem.type == 'average'
    value = average _.pluck list, 'value'
  else if firstItem.type == 'gauge'
    value = _.last(list).value
  else
    value = sum _.pluck list, 'value'
  db.findOneAndUpdate collection, query, {
    '$push' : 
      'values' : 
        t : Math.floor createdAt / 1000
        v : value
  }
  LOG_DATA_DICT[key] = []
  return


sum = (data) ->
  _.reduce data, (memo, num) ->
    memo + num
  , 0

average = (data) ->
  total = sum data
  Math.round total / data.length