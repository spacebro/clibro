import test from 'ava'
import sleep from 'sleep-promise'

// import { client, init } from '../initSpacebro'
import { init } from '../initSpacebro'

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
    channel: 'clibro-test-is',
    client: 'clibro'
  }
  const serverStr = 'spacebro.space:3333#clibro-test-is'

  await init(config, logger)
  await sleep(100)

  t.deepEqual(
    logger.logs,
    [
      [`Connecting to spacebro server '${serverStr}'...`],
      [`clibro connected to '${serverStr}'`],
      ['New member connected: clibro']
    ]
  )
  t.deepEqual(logger.errors, [])
  t.deepEqual(logger.warnings, [])
})
