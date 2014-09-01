(function() {
  var db, dgram, doLag, server, stats, _;

  dgram = require('dgram');

  server = dgram.createSocket('udp4');

  db = require('./db');

  stats = require('./stats');

  _ = require('underscore');

  doLag = function() {
    var lagCount, lagLog, lagTotal, toobusy;
    lagTotal = 0;
    lagCount = 0;
    toobusy = require('toobusy');
    lagLog = function() {
      var lag;
      lagTotal += toobusy.lag();
      lagCount++;
      if (lagCount === 10) {
        lag = Math.ceil(lagTotal / lagCount);
        lagCount = 0;
        lagTotal = 0;
        stats.add("jtstats|lag|average|" + lag + "|" + (Date.now()));
      }
      return setTimeout(lagLog, 1000);
    };
    return lagLog();
  };

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
      if (options.enableLog) {
        console.log(arr.join('\n'));
      }
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
    server.bind(options.port || 9300, options.host || '127.0.0.1');
    return doLag();
  };

}).call(this);
