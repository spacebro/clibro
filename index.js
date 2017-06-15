#!/usr/bin/env node
'use strict'

const vorpal = require('vorpal')()
const spacebroClient = require('spacebro-client')
const config = require('standard-settings').getSettings().service.spacebro

const { subscribe, unsubscribe, emit } = require('./commands')

spacebroClient.connect(config.address, config.port, {
  clientName: config.client,
  channelName: config.channel,
  verbose: false
})

const serverStr = `${config.address}:${config.port}#${config.channel}`

spacebroClient.on('connect', () => {
  vorpal.log(`${config.client} connected to '${serverStr}'`)
})

spacebroClient.on('connect_error', (err) => {
  vorpal.log(`Error trying to connect ${config.client} to '${serverStr}':`, err)
  process.exit(1)
})
spacebroClient.on('connect_timeout', () => {
  vorpal.log(`Timed out trying to connect ${config.client} to '${serverStr}'`)
  process.exit(1)
})
spacebroClient.on('error', (err) => {
  vorpal.log('Error:', err)
  process.exit(1)
})

spacebroClient.on('new-member', (data) => {
  vorpal.log(`New member connected: ${data.member}`)
})

vorpal
  .command('subscribe <event>', 'Start listening to a specific spacebro event.')
  .action(subscribe)

vorpal
  .command('unsubscribe <event>', 'Stop listening to a specific spacebro event.')
  .action(unsubscribe)

vorpal
  .command('emit <event> [data]', 'Emits a spacebro event with optional data. JSON must be surrounded by quotes.')
  .option('--interval <seconds>', 'The event will be emitted at specified interval (in seconds).')
  .option('--stop', 'Stops the interval for a given spacebro event.')
  .action(emit)

vorpal
  .delimiter('spacebro-client$')
  .show()
