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
    var options;
    options = {
      db: {
        native_parser: true
      },
      server: {
        poolSize: 5
      }
    };
    db = mongoose.createConnection(uri, options);
    db.on('connected', function() {
      return console.log("" + uri + " connected");
    });
    db.on('disconnected', function() {
      return console.log("" + uri + " disconnected");
    });
  };


  /**
   * [findOneAndUpdate mongoose的findOneAndUpdate]
   * @param  {String} collection
   * @param  {Object} query
   * @param  {Object} update
   * @return {[type]}
   */

  module.exports.findOneAndUpdate = function(collection, query, update, cbf) {
    var Model, options;
    if (cbf == null) {
      cbf = noop;
    }
    Model = modelDict[collection];
    if (!Model) {
      Model = getModel(collection);
    }
    options = {
      upsert: true,
      multi: false
    };
    return Model.update(query, update, options, cbf);
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
        key: 1
      }, {
        key: 1,
        date: 1
      }
    ]);
    model = db.model(collection, schema);
    modelDict[collection] = model;
    return model;
  };

}).call(this);
