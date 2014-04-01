_ = require 'underscore'
saveInterval = 10 * 1000
LOG_DATA_DICT = {}

module.exports.add = (data) ->
  now = Date.now()
  data.createdAt = now
  tag = data.tag
  if !LOG_DATA_DICT[tag]
    LOG_DATA_DICT[tag] = []
  list = LOG_DATA_DICT[tag]
  first = _.first list
  saveData tag if first && first.createdAt + saveInterval < now

  LOG_DATA_DICT[tag].push data

saveData = (tag) ->
  list = LOG_DATA_DICT[tag]
  console.dir list
  LOG_DATA_DICT[tag] = []

