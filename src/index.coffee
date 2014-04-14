dgram = require 'dgram'
server = dgram.createSocket 'udp4'
db = require './db'
stats = require './stats'

module.exports.start = (options = {}) ->
  server.on 'listening', ->
    address = server.address()
    console.dir "UDP server listening on #{address.address}:#{address.port}"
  server.on 'message', (msg) ->
    data = JSON.parse msg
    stats.add data

  db.initDb = options.uri
  
  stats.setInterval options.interval if options.interval

  server.bind options.port || 9300, options.host || '127.0.0.1'