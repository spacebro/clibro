#!/usr/bin/env node
'use strict'

const { CLI } = require('cliffy')
const cli = new CLI()
const config = require('standard-settings').getSettings().service.spacebro
const spacebro = require('./src/initSpacebro')

cli.log = console.log
cli.warn = console.warn

spacebro.init(config, cli)
  .then((client) => {
    const subscribe = require('./src/commands')(client, cli).subscribe
    const unsubscribe = require('./src/commands')(client, cli).unsubscribe
    const emit = require('./src/commands')(client, cli).emit
    cli
      .command('listen', {
        description: 'Start listening to a specific event',
        parameters: ['event'],
        subcommands: {
          to: {
            description: 'listen to an event',
            parameters: ['event'],
            action: subscribe
          }
        }
      })

    cli
      .command('off', {
        description: 'Stop listening from a specific event',
        parameters: ['event'],
        subcommands: {
          from: {
            description: 'off from an event',
            parameters: ['event'],
            action: unsubscribe
          }
        }
      })

    cli
      .command('emit', {
        description: 'Emit an an event',
        options: [{ label: 'stop', description: 'Stop to emit a specific event' }],
        parameters: ['event', { label: 'data', optional: true }],
        action: (params, options) => {
          if (options.stop) {
            console.log(`Stop running ${params.event}`)
            emit(params.event, params.data, { stop: true })
            return
          }
          console.log(`emit ${params.event}`)
          if (params.data) {
            console.log(`with data ${params.data}`)
          }
          emit({ event: params.event, data: params.data, options: {} })
        },
        subcommands: {
          every: {
            description: 'emit the event every XX seconds',
            parameters: ['intervaltime', 'event', { label: 'data', optional: true }],
            action: params => {
              console.log(`emit ${params.event} every ${params.intervaltime} with data: ${params.data}`)
              emit(params.event, params.data, { interval: params.intervaltime })
            }
          }
        }
      })

    cli.show()
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

cli
  .setDelimiter('spacebro2-client$')
