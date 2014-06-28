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
  options = 
    db :
      native_parser : true
    server :
      poolSize : 5
  db = mongoose.createConnection uri, options
  db.on 'connected', ->
    console.log "#{uri} connected"
  db.on 'disconnected', ->
    console.log "#{uri} disconnected"
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
  return throw new Error 'the db is not init!' if !db
    
  schema = new Schema {}, {
    safe : false
    strict : false
    collection : collection
  }
  schema.index [
    {
      key : 1
    }
    {
      key : 1
      date : 1
    }
  ]
  model = db.model collection, schema
  modelDict[collection] = model
  model