dgram = require 'dgram'
server = dgram.createSocket 'udp4'
db = require './db'
stats = require './stats'
_ = require 'underscore'



doLag = ->
  lagTotal = 0
  lagCount = 0
  toobusy = require 'toobusy'
  lagLog = ->
    lagTotal += toobusy.lag()
    lagCount++
    if lagCount == 10
      lag = Math.ceil lagTotal / lagCount
      lagCount = 0
      lagTotal = 0
      stats.add "jtstats|lag|average|#{lag}|#{Date.now()}"
    setTimeout lagLog, 1000
  lagLog()



module.exports.start = (options = {}) ->
  server.on 'listening', ->
    address = server.address()
    console.log "jtstats, UDP server listening on #{address.address}:#{address.port}"
  server.on 'message', (msg) ->

    msg = msg.toString()
    console.log msg if options.enableLog
    stats.add msg

  if !options.uri
    throw new Error 'the mongodb uri is undefined'
  db.initDb options.uri
  
  stats.setInterval options.interval if options.interval

  server.bind options.port || 9300, options.host || '127.0.0.1'

  doLag()


    