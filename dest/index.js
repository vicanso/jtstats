(function() {
  var db, dgram, server, stats, _;

  dgram = require('dgram');

  server = dgram.createSocket('udp4');

  db = require('./db');

  stats = require('./stats');

  _ = require('underscore');

  module.exports.start = function(options) {
    if (options == null) {
      options = {};
    }
    server.on('listening', function() {
      var address;
      address = server.address();
      return console.log("jtstats, UDP server listening on " + address.address + ":" + address.port);
    });
    server.on('message', function(msg) {
      var arr;
      arr = msg.toString().split('||');
      return _.each(arr, function(msg) {
        return stats.add(msg);
      });
    });
    if (!options.uri) {
      throw new Error('the mongodb uri is undefined');
    }
    db.initDb(options.uri);
    if (options.interval) {
      stats.setInterval(options.interval);
    }
    return server.bind(options.port || 9300, options.host || '127.0.0.1');
  };

}).call(this);
