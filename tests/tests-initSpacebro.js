import test from 'ava'
import sleep from 'sleep-promise'

import { init } from '../src/initSpacebro'

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

test.serial('Simple connection', async t => {
  const { logger } = t.context
  const config = {
    address: 'spacebro.space',
    port: 3333,
    channel: 'clibro-tests-initSb',
    client: 'clibro'
  }
  const serverStr = 'spacebro.space:3333#clibro-tests-initSb'

  await init(config, logger)
  await sleep(100)

  t.deepEqual(
    logger.logs,
    [
      [`Connecting to spacebro server "${serverStr}"...`],
      [`clibro connected to "${serverStr}"`],
      ['New member connected: clibro']
    ]
  )
  t.deepEqual(logger.errors, [])
  t.deepEqual(logger.warnings, [])
})

test.serial('Connection wrong port', async t => {
  const { logger } = t.context
  const config = {
    address: 'spacebro.space',
    port: 1234,
    channel: 'clibro-tests-initSb',
    client: 'clibro'
  }
  const serverStr = 'spacebro.space:1234#clibro-tests-initSb'

  // TODO - Have clearer error messages
  // https://github.com/spacebro/clibro/issues/10
  const error = await t.throws(init(config, logger))
  const expectedMessage = `Error trying to connect clibro to "${serverStr}":\n`
  t.is(error.slice(0, expectedMessage.length), expectedMessage)

  t.deepEqual(
    logger.logs, [[`Connecting to spacebro server "${serverStr}"...`]]
  )
  t.deepEqual(logger.errors, [])
  t.deepEqual(logger.warnings, [])
})
