#!/usr/bin/env node
'use strict'

const vorpal = require('vorpal')()
const config = require('standard-settings').getSettings().service.spacebro

const { subscribe, unsubscribe, emit } = require('./commands')
const spacebro = require('./initSpacebro')

vorpal.warn = console.warn
vorpal.error = console.error

spacebro.init(config, vorpal)
  .then(() => {
    vorpal.show()
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
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
