dgram = require 'dgram'
server = dgram.createSocket 'udp4'
db = require './db'
stats = require './stats'
_ = require 'underscore'

module.exports.start = (options = {}) ->
  server.on 'listening', ->
    address = server.address()
    console.log "jtstats, UDP server listening on #{address.address}:#{address.port}"
  server.on 'message', (msg) ->

    arr = msg.toString().split '||'
    console.log arr.join '\n' if options.enableLog
    _.each arr, (msg) ->
      stats.add msg

  if !options.uri
    throw new Error 'the mongodb uri is undefined'
  db.initDb options.uri
  
  stats.setInterval options.interval if options.interval

  server.bind options.port || 9300, options.host || '127.0.0.1'
