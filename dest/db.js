(function() {
  var Schema, db, getModel, modelDict, mongoose, noop;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  db = null;

  modelDict = {};

  noop = function() {};


  /**
   * [initDb 初始化db]
   * @param  {[连接URI]} uri
   * @return {[type]}
   */

  module.exports.initDb = function(uri) {
    db = mongoose.connect(uri);
  };


  /**
   * [findOneAndUpdate mongoose的findOneAndUpdate]
   * @param  {String} collection
   * @param  {Object} query
   * @param  {Object} update
   * @return {[type]}
   */

  module.exports.findOneAndUpdate = function(collection, query, update) {
    var Model, options;
    Model = modelDict[collection];
    if (!Model) {
      Model = getModel(collection);
    }
    options = {
      upsert: true,
      multi: false
    };
    return Model.update(query, update, options, noop);
  };


  /**
   * [getModel 获取model]
   * @param  {String} collection
   * @return {[type]}
   */

  getModel = function(collection) {
    var model, schema;
    if (!db) {
      throw new Error('the db is not init!');
    }
    schema = new Schema({}, {
      safe: false,
      strict: false,
      collection: collection
    });
    schema.index([
      {
        date: 1,
        type: 1,
        category0: 1
      }, {
        date: 1,
        type: 1,
        category0: 1,
        category1: 1
      }, {
        date: 1,
        type: 1,
        category0: 1,
        category1: 1,
        category2: 1
      }, {
        date: 1,
        type: 1,
        category0: 1,
        category1: 1,
        category2: 1,
        category3: 1
      }
    ]);
    model = db.model(collection, schema);
    modelDict[collection] = model;
    return model;
  };

}).call(this);
