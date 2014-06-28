_ = require 'underscore'
db = require './db'
saveInterval = 10 * 1000
LOG_DATA_DICT = {}

###*
 * [add 添加统计]
 * @param {[type]} data
###
module.exports.add = (msg) ->
  arr = msg.split '|'
  createdAt = GLOBAL.parseInt arr[4]
  data =
    category : arr[0]
    key : arr[1]
    type : arr[2]
    value : GLOBAL.parseInt arr[3]
    createdAt : createdAt
  key = "#{data.category}#{data.key}"
  LOG_DATA_DICT[key] = [] if !LOG_DATA_DICT[key]
  list = LOG_DATA_DICT[key]
  firstItem = _.first list
  if firstItem?.createdAt + saveInterval < createdAt
    saveData key 
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
  LOG_DATA_DICT[key] = []
  lastItem = _.last list

  # console.dir Date.now()
  # console.dir list

  createdAt = lastItem.createdAt
  type = lastItem.type
  date = new Date createdAt
  collection = lastItem.category
  query =
    date : formatDate date
    type : type
    key : lastItem.key

  if lastItem.type == 'average'
    value = average _.pluck list, 'value'
  else if lastItem.type == 'gauge'
    value = _.last(list).value
  else
    value = sum _.pluck list, 'value'
  db.findOneAndUpdate collection, query, {
    '$push' : 
      'values' : 
        t : Math.floor createdAt / 1000
        v : value
  }
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