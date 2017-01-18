#!/usr/bin/env node

const vorpal = require('vorpal')()
const spacebroClient = require('spacebro-client')
const config = require('./config')

spacebroClient.connect( config.spacebro.address,
                        config.spacebro.port,
                        { clientName: 'spacebro-client-cli',
                          channelName: config.channelName,
                          verbose: false })

vorpal
  .command('emit <event> <data>', 'Emits a spacebro event.\n<event> is the event name\n<data> is JSON parsed data')
  .action(function (args, callback) {
    try {
      var data = JSON.parse(args.data)
    } catch (e) {
      this.log('Parsing Error in <data> argument:\n', e)
      return callback()
    } 
    spacebroClient.emit(args.event, data)
    this.log('Emitted event "', args.event, '" with data', data)
    return callback()
  })

vorpal
  .delimiter('spacebro-client-cli$')
  .show()
