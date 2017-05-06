#!/usr/bin/env node
'use strict'

const vorpal = require('vorpal')()
const spacebroClient = require('spacebro-client')
const standardSettings = require('standard-settings')
const config = require('nconf').get()
const intervals = []

spacebroClient.connect(config.server.spacebro.address, config.server.spacebro.port,
  {
    clientName: config.clientName,
    channelName: config.channelName,
    verbose: false
  }
)

spacebroClient.on('new-member', (data) => {
  vorpal.log(`New member connected: ${data.member}`)
})

vorpal
  .command('subscribe <event>', 'Start listening to a specific spacebro event.')
  .action((args, callback) => {
    spacebroClient.on(args.event, (data) => {
      try {
        data = JSON.stringify(data)
      } catch (e) {
        console.warn(e)
      }
      vorpal.log('Received event "' + args.event + '" with data ' + data)
    })
    vorpal.activeCommand.log('Subscribed to event "' + args.event + '"')
    return callback()
  })

vorpal
  .command('unsubscribe <event>', 'Stop listening to a specific spacebro event.')
  .action((args, callback) => {
    spacebroClient.off(args.event)
    vorpal.log('Unsubscribed to event "' + args.event + '"')
    return callback()
  })

vorpal
  .command('emit <event> [data]', 'Emits a spacebro event with optionnal data. JSON must be surrounded by quotes.')
  .option('--interval <seconds>', 'The event will be emitted at specified interval (in seconds).')
  .option('--stop', 'Stops the interval for a given spacebro event.')
  .action(({ event, data, options }, callback) => {
    if (options.stop) {
      clearInterval(intervals[event])
      vorpal.activeCommand.log(`Cleared interval for event ${event}`)
    } else if (options.interval) {
      if (isNaN(options.interval)) {
        vorpal.activeCommand.log('Error: the interval must be a positive integer')
        return callback()
      }
      let interval = setInterval(() => {
        spacebroClient.emit(event, data)
      }, options.interval * 1000)
      intervals[event] = interval
    } else {
      spacebroClient.emit(event, data)
      vorpal.activeCommand.log(`Emitted event '${event}' with data ${data}`)
    }
    return callback()
  })

vorpal
  .delimiter('spacebro-client$')
  .show()
