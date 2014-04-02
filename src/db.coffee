mongoose = require 'mongoose'
Schema = mongoose.Schema
config = require './config'

db = mongoose.connect config.mongodbUri

modelDict = {}
noop = ->

module.exports.findOneAndUpdate = (collection, query, update) ->
  Model = modelDict[collection]
  Model = getModel collection if !Model
  options =
    upsert : true
    multi : false
  Model.update query, update, options, noop

getModel = (collection) ->
  schema = new Schema {}, {
    safe : false
    strict : false
    collection : collection
  }
  schema.index [
    {
      category : 1
      tag : 1
      date : 1
      type : 1
    }
  ]
  model = db.model collection, schema
  modelDict[collection] = model
  model