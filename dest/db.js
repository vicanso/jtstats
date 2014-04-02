(function() {
  var Schema, config, db, getModel, modelDict, mongoose, noop;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  config = require('./config');

  db = mongoose.connect(config.mongodbUri);

  modelDict = {};

  noop = function() {};

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

  getModel = function(collection) {
    var model, schema;
    schema = new Schema({}, {
      safe: false,
      strict: false,
      collection: collection
    });
    schema.index([
      {
        category: 1,
        tag: 1,
        date: 1,
        type: 1
      }
    ]);
    model = db.model(collection, schema);
    modelDict[collection] = model;
    return model;
  };

}).call(this);
