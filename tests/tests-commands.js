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

test.todo('$ emit') // No data - Valid data - Invalid data
test.todo('$ emit --interval')
test.todo('$ emit --stop') // Normal - called twice
