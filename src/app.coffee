config = require './config'
jtStats = require './index'

jtStats.start {
  port : config.port
  host : config.host
  interval : config.interval
  uri : config.mongodbUri
  enableLog : config.enableLog
}