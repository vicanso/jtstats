'use strict';
var async = require('async');
var mongoose = require('mongoose');
var util = require('util');
var Schema = mongoose.Schema;

var mongooseConnection = null;
var modelDict = {};
var noop = function(){};
var _ = require('lodash');
var currentCategoryDict = {};
var debug = require('debug')('jt.stats');

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
    console.log('mongodb connected');
  });
  mongooseConnection.on('disconnected', function(){
    console.log('mongodb disconnected');
  });
  mongooseConnection.on('error', function(err){
    console.error(err);
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
  var Model = getModel(collection);
  var options = {
    upsert : true,
    multi : false
  };
  debug('update query:%j, data:%j', query, update);
  Model.update(query, update, options, cbf);
};


exports.addStatsCategory = function(category){
  if(!currentCategoryDict[category]){
    currentCategoryDict[category] = true;
    var Model = getStatsCategoryModel();
    async.waterfall([
      function(cbf){
        Model.findOne({name : category}, cbf);
      },
      function(doc, cbf){
        if(doc){
          cbf();
        }else{
          new Model({
            name : category
          }).save(cbf);
        }
      }
    ], function(err){
      if(err){
        delete currentCategoryDict[category];
      }
    });
  }
};

function getStatsCategoryModel(){
  var collection = 'stats-category';
  var Model = modelDict[collection];
  if(!Model){
    var schema = new Schema({
      name : {
        type : String,
        required : true,
        unique : true
      }
    }, {
      collection : 'stats-category'
    });
    schema.index([
      {
        name : 1
      }
    ]);
    Model = mongooseConnection.model(collection, schema);
    modelDict[collection] = Model;
  }
  return Model;
}

/**
 * [getCollectionNames description]
 * @param  {[type]} cbf [description]
 * @return {[type]}     [description]
 */
exports.getCollectionNames = function(cbf){
  if(!mongooseConnection){
    throw new Error('the db is not init!');
  }
  getStatsCategoryModel().find({}, 'name', function(err, docs){
    if(err){
      cbf(err);
    }else{
      cbf(null, _.pluck(docs, 'name'));
    }
  });
};

/**
 * [getModel 获取model]
 * @param  {[type]} collection [description]
 * @return {[type]}            [description]
 */
function getModel(collection){
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
}
exports.model = getModel;