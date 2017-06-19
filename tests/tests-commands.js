import test from 'ava'
import sleep from 'sleep-promise'

import { getSettings } from 'standard-settings'
const config = getSettings().service.spacebro

import { subscribe, unsubscribe, emit } from '../commands'
import spacebro from '../initSpacebro'

test.before(async t => {
  const consoleSansLog = {
    log: () => {},
    error: console.error,
    warn: console.warn
  }
  await spacebro.init(config, consoleSansLog)
})

test.beforeEach(t => {
  t.context.logger = {
    logs: [],
    log (...args) {
      this.logs.push(args)
    },
    errors: [],
    error (...args) {
      this.errors.push(args)
    },
    warnings: [],
    warn (...args) {
      this.warnings.push(args)
    }
  }
})

test('Has commands', t => {
  t.is(typeof subscribe, 'function')
  t.is(typeof unsubscribe, 'function')
  t.is(typeof emit, 'function')
})

test('$ subscribe', async t => {
  t.plan(10)

  subscribe.bind(t.context.logger)({ event: 'foobar' }, () => { t.pass() })
  t.deepEqual(t.context.logger.logs, [['Subscribed to event "foobar"']])

  t.context.logger.logs = []
  spacebro.client.emit('foobar')
  await sleep(200) // 200 ms
  t.skip.deepEqual(t.context.logger.logs, [['Received event "foobar" with no data']])

  t.context.logger.logs = []
  spacebro.client.emit('foobar', 10)
  await sleep(200) // 200 ms
  t.deepEqual(t.context.logger.logs, [['Received event "foobar" with data 10']])

  t.context.logger.logs = []
  spacebro.client.emit('foobar', { abc: 'def' })
  await sleep(200) // 200 ms
  t.deepEqual(t.context.logger.logs, [[
    'Received event "foobar" with data ' +
    '{"abc":"def","_to":null,"_from":"clibro"}'
  ]])

  t.deepEqual(t.context.logger.warnings, [], 'No warnings logged')
  t.deepEqual(t.context.logger.errors, [], 'No errors logged')

  subscribe.bind(t.context.logger)({ event: 'foobar' }, () => { t.pass() })
  t.skip.deepEqual(t.context.logger.errors, [['"foobar" already subscribed']])
  t.skip.deepEqual(t.context.logger.logs, [])
})

test.todo('Load settings')
test.todo('Connection') // Success - Error - New member
test.todo('$ unsubscribe') // Normal - Called twice
test.todo('$ emit') // No data - Valid data - Invalid data
test.todo('$ emit --interval')
test.todo('$ emit --stop') // Normal - called twice
