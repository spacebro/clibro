#!/usr/bin/env node

const vorpal = require('vorpal')()
const spacebroClient = require('spacebro-client')
const config = require('./config')

spacebroClient.connect(config.spacebro.address,
                        config.spacebro.port,
  { clientName: 'spacebro-client-cli',
    channelName: config.channelName,
    verbose: false })

vorpal
  .command('subscribe <event>', 'Start listening to a specific spacebro event.')
  .action(function (args, callback) {
    spacebroClient.on(args.event, (data) => {
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
  .action(function (args, callback) {
    try {
      var data = (args.data) ? JSON.parse(args.data) : undefined
    } catch (e) {
      this.log("Parsing Error in 'data' argument:\n", e)
      return callback()
    }
    spacebroClient.emit(args.event, data)
    this.log('Emitted event "' + args.event + '" with data ' + data)
    return callback()
  })

vorpal
  .delimiter('spacebro-client-cli$')
  .show()
