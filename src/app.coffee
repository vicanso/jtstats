config = require './config'
dgram = require 'dgram'
server = dgram.createSocket 'udp4'
# stats = require './stats'

server.on 'listening', ->
  address = server.address()
  console.dir "UDP server listening on #{address.address}:#{address.port}"

server.on 'message', (msg) ->
  data = JSON.parse msg
  console.dir data
  # stats.add data

server.bind config.port, config.host