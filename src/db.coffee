mongoose = require 'mongoose'
Schema = mongoose.Schema

db = null

modelDict = {}
noop = ->

###*
 * [initDb 初始化db]
 * @param  {[连接URI]} uri
 * @return {[type]}
###
module.exports.initDb = (uri) ->
  db = mongoose.connect uri
  return

###*
 * [findOneAndUpdate mongoose的findOneAndUpdate]
 * @param  {String} collection
 * @param  {Object} query
 * @param  {Object} update
 * @return {[type]}
###
module.exports.findOneAndUpdate = (collection, query, update) ->
  Model = modelDict[collection]
  Model = getModel collection if !Model
  options =
    upsert : true
    multi : false
  Model.update query, update, options, noop

###*
 * [getModel 获取model]
 * @param  {String} collection
 * @return {[type]}
###
getModel = (collection) ->
  if !db
    return throw new Error 'the db is not init!'
    
  schema = new Schema {}, {
    safe : false
    strict : false
    collection : collection
  }
  schema.index [
    {
      date : 1
      type : 1
      category0 : 1
    }
    {
      date : 1
      type : 1
      category0 : 1
      category1 : 1
    }
    {
      date : 1
      type : 1
      category0 : 1
      category1 : 1
      category2 : 1
    }
    {
      date : 1
      type : 1
      category0 : 1
      category1 : 1
      category2 : 1
      category3 : 1
    }
  ]
  model = db.model collection, schema
  modelDict[collection] = model
  model