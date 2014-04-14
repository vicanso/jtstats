_ = require 'underscore'
db = require './db'
saveInterval = 10 * 1000
LOG_DATA_DICT = {}

###*
 * [add 添加统计]
 * @param {[type]} data
###
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
  return

###*
 * [setInterval 设置保存数据的时间间隔（默认为10s）]
 * @param {[type]} value
###
module.exports.setInterval = (value) ->
  if value && value > 0
    saveInterval = value
  return

###*
 * [saveData 保存数据]
 * @param  {[type]} key
 * @return {[type]}
###
saveData = (key) ->
  list = LOG_DATA_DICT[key]
  firstItem = _.first list
  createdAt = firstItem.createdAt
  type = firstItem.type
  date = new Date createdAt
  infos = key.split '.'
  collection = infos[0]
  category = infos[1]
  tag = infos[2]
  query = 
    date : formatDate date
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


formatDate = (date) ->
  str = date.getFullYear()
  month = date.getMonth() + 1
  str += '-'
  if month < 10
    str += "0#{month}"
  else
    str += month
  day = date.getDate()
  str += '-'
  if day < 10
    str += "0#{day}"
  else
    str += day

sum = (data) ->
  _.reduce data, (memo, num) ->
    memo + num
  , 0

average = (data) ->
  total = sum data
  Math.round total / data.length