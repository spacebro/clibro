#!/usr/bin/env node
'use strict'

const vorpal = require('vorpal')()
const spacebroClient = require('spacebro-client')
const fs = require('fs')

let config = require('./user-configs/default.json')

if (fs.existsSync('./config.json')) {
  config = require('./config.json')
}

const intervals = []

spacebroClient.connect(config.spacebro.address, config.spacebro.port,
  {
    clientName: config.clientName,
    channelName: config.channelName,
    verbose: false
  }
)

vorpal
  .command('subscribe <event>', 'Start listening to a specific spacebro event.')
  .action(function (args, callback) {
    spacebroClient.on(args.event, (data) => {
      try {
        data = JSON.stringify(data)
      } catch (e) {
        console.log(e)
      }
      this.log('Received event "' + args.event + '" with data ' + data)
    })
    this.log('Subscribed to event "' + args.event + '"')
    return callback()
  })

vorpal
  .command('unsubscribe <event>', 'Stop listening to a specific spacebro event.')
  .action(function (args, callback) {
    spacebroClient.off(args.event)
    this.log('Unsubscribed to event "' + args.event + '"')
    return callback()
  })

vorpal
  .command('emit <event> [data]', 'Emits a spacebro event with optionnal data. JSON must be surrounded by quotes.')
  .option('--interval <seconds>', 'The event will be emitted at specified interval (in seconds).')
  .option('--stop', 'Stops the interval for a given spacebro event.')
  .action(function ({ event, data, options }, callback) {
    if (options.stop) {
      clearInterval(intervals[event])
      this.log(`Cleared interval for event ${event}`)
    } else if (options.interval) {
      if (isNaN(options.interval)) {
        this.log('Error: the interval must be a positive integer')
        return callback()
      }
      let interval = setInterval(() => {
        spacebroClient.emit(event, data)
      }, options.interval * 1000)
      intervals[event] = interval
    } else {
      spacebroClient.emit(event, data)
      this.log(`Emitted event '${event}' with data ${data}`)
    }
    return callback()
  })

vorpal
  .delimiter('SC-CLI$')
  .show()
