#!/usr/bin/env node
'use strict'

const vorpal = require('vorpal')()
const spacebroClient = require('spacebro-client')
const fs = require('fs')

let config = require('./user-configs/default.json')

if (fs.existsSync('./config.json')) {
  config = require('./config.json')
}

var intervals = []

spacebroClient.connect(config.spacebro.address,
                        config.spacebro.port,
  { clientName: 'spacebro-client-cli',
    channelName: config.channelName,
    verbose: false })

vorpal
  .command('subscribe <event>', 'Start listening to a specific spacebro event.')
  .action(function (args, callback) {
    spacebroClient.on(args.event, (data) => {
      try {
        data = JSON.stringify(data)
      }
      catch (e) {
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
  .command('emit <event> [data]', 'Emits a spacebro event with optionnal JSON parsed data.')
  .option('--interval <seconds>', 'The event will be emitted at specified interval (in seconds).') 
  .option('--stop', 'Stops the interval for a given spacebro event.')
  .action(function (args, callback) {
    try {
      var data = (args.data) ? JSON.parse(args.data) : undefined
    } catch (e) {
      this.log("Parsing Error in 'data' argument:\n", e)
      return callback()
    }
    if (args.options.stop) {
      clearInterval(intervals[args.event])
      this.log('Cleared interval for event "' + args.event + '"')
    }
    else if (args.options.interval) {
      if (isNaN(args.options.interval)) { 
        this.log('Error: the interval must be a positive integer')
        return callback()
      }
      var i = setInterval(_ => {
        spacebroClient.emit(args.event, data)
      }, args.options.interval * 1000)
      intervals[args.event] = i
    } else {
      spacebroClient.emit(args.event, data)
      this.log('Emitted event "' + args.event + '" with data ' + data)
    }
    return callback()
  })

vorpal
  .delimiter('spacebro-client-cli$')
  .show()
