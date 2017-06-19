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
  t.context.test_subscribe = subscribe.bind(t.context.logger)
  t.context.test_unsubscribe = unsubscribe.bind(t.context.logger)
  t.context.test_emit = emit.bind(t.context.logger)
})

test.afterEach(t => {
  t.context.test_unsubscribe({ event: 'foobar' }, () => {})
})

test('Has commands', t => {
  t.is(typeof subscribe, 'function')
  t.is(typeof unsubscribe, 'function')
  t.is(typeof emit, 'function')
})

test('subscribe - Simple use', async t => {
  const { logger, test_subscribe } = t.context
  t.plan(4)

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  t.deepEqual(logger.logs, [['Subscribed to event "foobar"']])

  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')
})

test.failing('subscribe - Data sent', async t => {
  const { logger, test_subscribe } = t.context
  t.plan(7)

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  logger.logs = []

  spacebro.client.emit('foobar')
  await sleep(200) // 200 ms
  t.deepEqual(logger.logs[0], ['Received event "foobar" with no data'])

  spacebro.client.emit('foobar', 10)
  await sleep(200) // 200 ms
  t.deepEqual(logger.logs[1], ['Received event "foobar" with data 10'])

  spacebro.client.emit('foobar', { abc: 'def' })
  await sleep(200) // 200 ms
  t.deepEqual(logger.logs[2], [
    'Received event "foobar" with data ' +
    '{"abc":"def","_to":null,"_from":"clibro"}'
  ])

  t.is(logger.logs.length, 3)
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')
})

test.failing('subscribe - Twice', async t => {
  const { logger, test_subscribe } = t.context
  t.plan(10)

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  logger.logs = []
  test_subscribe({ event: 'foobar' }, () => { t.pass() })

  t.deepEqual(logger.errors, [['"foobar" already subscribed']])
  t.deepEqual(logger.logs, [], 'No new messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
})

test('unsubscribe - Once', async t => {
  const { logger, test_subscribe, test_unsubscribe } = t.context
  t.plan(6)

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  test_unsubscribe({ event: 'foobar' }, () => { t.pass() })
  t.deepEqual(
    logger.logs,
    [['Subscribed to event "foobar"'], ['Unsubscribed from event "foobar"']]
  )
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')

  logger.logs = []
  spacebro.client.emit('foobar', { abc: 'def' })
  await sleep(200) // 200 ms
  t.deepEqual(logger.logs, [], 'Event no longer intercepted')
})

test.failing('unsubscribe - Twice', async t => {
  const { logger, test_subscribe, test_unsubscribe } = t.context
  t.plan(7)

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  test_unsubscribe({ event: 'foobar' }, () => { t.pass() })
  logger.logs = []

  test_unsubscribe({ event: 'foobar' }, () => { t.pass() })
  test_unsubscribe({ event: 'abcde' }, () => { t.pass() })
  t.deepEqual(
    logger.errors,
    [['Event "foobar" does not exist'], ['Event "abcde" does not exist']]
  )
  t.deepEqual(logger.logs, [], 'No messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
})

test('unsubscribe - Subscribe again', async t => {
  const { logger, test_subscribe, test_unsubscribe } = t.context
  t.plan(6)

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  test_unsubscribe({ event: 'foobar' }, () => { t.pass() })
  logger.logs = []

  test_subscribe({ event: 'foobar' }, () => { t.pass() })
  t.deepEqual(logger.logs, [['Subscribed to event "foobar"']])
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')
})

test.failing('unsubscribe - Reserved event', async t => {
  const { logger, test_unsubscribe } = t.context
  t.plan(4)

  test_unsubscribe({ event: 'new-member' }, () => { t.pass() })
  t.deepEqual(
    logger.errors, ['Cannot unsubscribe reserved event "new-member"']
  )
  t.deepEqual(logger.logs, [], 'No messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
})

test.failing.serial.cb('emit - No data', t => {
  const { logger, test_emit } = t.context
  t.plan(4)

  function cb (data) {
    t.deepEqual(data, {_to: null, _from: 'clibro'})
    spacebro.client.off('emitEvent', cb)
    t.end()
  }
  spacebro.client.on('emitEvent', cb)
  test_emit({ event: 'emitEvent', options: {} })

  t.deepEqual(logger.logs, [['Emitted event "emitEvent" with no data']])
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')
})

test.failing.serial.cb('emit - Valid data', t => {
  const { logger, test_emit } = t.context
  t.plan(5)

  function cb (data) {
    t.deepEqual(data, {_to: null, _from: 'clibro', str: 'abcd'})
    spacebro.client.off('emitEvent', cb)
    t.end()
  }
  spacebro.client.on('emitEvent', cb)
  test_emit(
    { event: 'emitEvent', data: '{"str": "abcd"}', options: {} },
    () => { t.pass() }
  )

  t.deepEqual(
    logger.logs, [['Emitted event "emitEvent" with data {"str": "abcd"}']]
  )
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')
})

test.failing.serial('emit - Invalid data', async t => {
  const { logger, test_emit } = t.context
  t.plan(4)

  function cb (data) {
    t.fail('No callback should be called')
    spacebro.client.off('emitEvent', cb)
  }
  spacebro.client.on('emitEvent', cb)
  test_emit(
    { event: 'emitEvent', data: 'parse}THIS', options: {} },
    () => { t.pass() }
  )

  t.deepEqual(
    logger.errors,
    [['Parsing error: cannot read given data']]
  )
  t.deepEqual(logger.logs, [], 'No messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
})

test.failing.serial('emit - With --interval', async t => {
  const { logger, test_emit } = t.context
  const intervalCount = 3
  t.plan(intervalCount + 5)

  function cb (data) {
    t.deepEqual(data, {_to: null, _from: 'clibro', str: 'abcd'})
  }
  spacebro.client.on('emitEvent', cb)

  test_emit(
    {
      event: 'emitEvent',
      data: '{"str": "abcd"}',
      options: {interval: 0.5} // 500ms
    },
    () => { t.pass() }
  )
  t.deepEqual(
    logger.logs,
    [['Emitting event "emitEvent" every 0.5s with data {"str": "abcd"}']]
  )
  await sleep(intervalCount * 500 + 200)
  logger.logs = []

  t.deepEqual(logger.logs, [], 'No messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')

  spacebro.client.off('emitEvent', cb)
  test_emit({ event: 'emitEvent', options: {stop: true} }, () => { t.pass() })
})

test.failing.serial('emit - With --interval, wrong parameter', t => {
  const { logger, test_emit } = t.context
  t.plan(6)

  test_emit(
    { event: 'emitEvent', options: {interval: 'abcd'} },
    () => { t.pass() }
  )
  t.deepEqual(
    logger.errors, [['Error: the interval must be a positive integer']]
  )
  logger.errors = []

  test_emit(
    { event: 'emitEvent', options: {interval: -10} },
    () => { t.pass() }
  )
  t.deepEqual(
    logger.errors, [['Error: the interval must be a positive integer']]
  )

  t.deepEqual(logger.logs, [], 'No messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
})

test.failing.serial('emit - With --stop', async t => {
  const { logger, test_emit } = t.context
  t.plan(5)

  function cb () {
    t.fail('No event should be sent')
  }
  spacebro.client.on('stopEvent', cb)
  test_emit(
    { event: 'stopEvent', options: {interval: 0.5} },
    () => { t.pass() }
  )
  test_emit(
    { event: 'stopEvent', options: {stop: true} },
    () => { t.pass() }
  )

  await sleep(200)

  t.deepEqual(logger.logs, [
    ['Emitting event "stopEvent" every 0.5s with data {"str": "abcd"}'],
    ['Cleared interval for event "stopEvent"']
  ])
  t.deepEqual(logger.warnings, [], 'No warnings logged')
  t.deepEqual(logger.errors, [], 'No errors logged')

  spacebro.client.off('stopEvent', cb)
})

test.failing.serial('emit - With --stop without --interval', async t => {
  const { logger, test_emit } = t.context
  t.plan(4)

  test_emit(
    { event: 'stopEvent', options: {stop: true} },
    () => { t.pass() }
  )
  t.deepEqual(
    logger.errors, [['Error: interval "stopEvent" does not exist']]
  )
  t.deepEqual(logger.logs, [], 'No messages logged')
  t.deepEqual(logger.warnings, [], 'No warnings logged')
})
