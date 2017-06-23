'use strict'

const Vorpal = require('vorpal')
const { subscribe, unsubscribe, emit } = require('./commands')

function init () {
  const vorpal = Vorpal()

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

  return vorpal
}

module.exports = init
