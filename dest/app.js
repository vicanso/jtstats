(function() {
  var config, dgram, server;

  config = require('./config');

  dgram = require('dgram');

  server = dgram.createSocket('udp4');

  server.on('listening', function() {
    var address;
    address = server.address();
    return console.dir("UDP server listening on " + address.address + ":" + address.port);
  });

  server.on('message', function(msg) {
    var data;
    data = JSON.parse(msg);
    return console.dir(data);
  });

  server.bind(config.port, config.host);

}).call(this);
