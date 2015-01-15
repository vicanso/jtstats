'use strict';
exports.port = 6000;

exports.host = '127.0.0.1';

exports.mongodbUri = process.env.MONGODB_URI ||  'mongodb://localhost:10020/stats';