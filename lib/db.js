'use strict';

var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;

var mongooseConnection = null;
var modelDict = {};
var noop = function(){};
var _ = require('lodash');

/**
 * [initConnection 初始化连接]
 * @param  {[type]} uri [description]
 * @return {[type]}     [description]
 */
exports.initConnection = function(uri){
  if(mongooseConnection){
    return;
  }
  var options = {
    db : {
      native_parser : true
    },
    server : {
      poolSize : 5
    }
  };
  mongooseConnection = mongoose.createConnection(uri, options);
  mongooseConnection.on('connected', function(){
    console.log(util.format('%s connected', uri));
  });
  mongooseConnection.on('disconnected', function(){
    console.log(util.format('%s disconnected', uri));
  });
};

/**
 * [update 更新操作]
 * @param  {[type]} collection [description]
 * @param  {[type]} query      [description]
 * @param  {[type]} update     [description]
 * @param  {[type]} cbf        [description]
 * @return {[type]}            [description]
 */
exports.update = function(collection, query, update, cbf){
  if(!cbf){
    cbf = noop;
  }
  var Model = modelDict[collection];
  if(!Model){
    Model = getModel(collection);
  }
  var options = {
    upsert : true,
    multi : false
  };
  Model.update(query, update, options, cbf);
};


/**
 * [getCollectionNames description]
 * @param  {[type]} cbf [description]
 * @return {[type]}     [description]
 */
exports.getCollectionNames = function(cbf){
  if(!mongooseConnection){
    throw new Error('the db is not init!');
  }
  mongooseConnection.db.collectionNames(function(err, names){
    if(err){
      return cbf(err);
    }
    var result = [];
    _.each(names, function(info){
      var infos = info.name.split('.');
      infos.shift();
      var name = infos.join('.');
      if(_.first(infos) !== 'system'){
        result.push(name);
      }
    });
    cbf(null, result);
  });
};


/**
 * [getModel 获取model]
 * @param  {[type]} collection [description]
 * @return {[type]}            [description]
 */
var getModel = exports.model = function(collection){
  if(!mongooseConnection){
    throw new Error('the db is not init!');
  }
  if(modelDict[collection]){
    return modelDict[collection];
  }
  var schema = new Schema({}, {
    safe : false,
    strict : false,
    collection : collection
  });
  schema.index([
    {
      key : 1
    },
    {
      date : -1
    },
    {
      key : 1,
      date : -1
    }
  ]);
  var model = mongooseConnection.model(collection, schema);
  modelDict[collection] = model;
  return model;
};