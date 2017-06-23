import test from 'ava'
import sleep from 'sleep-promise'

import Vorpal from '../src/initVorpal'
import spacebro from '../src/initSpacebro'

import MyQueue from './MyQueue'

test.before(async t => {
  const config = {
    address: 'spacebro.space',
    port: 3333,
    channel: 'clibro-test-ete',
    client: 'clibro'
  }
  const consoleSansLog = {
    log: () => {},
    warn: console.warn,
    error: console.error
  }

  await spacebro.init(config, consoleSansLog)
})

test.beforeEach(async t => {
  const vorpal = Vorpal()
  const dataQueue = new MyQueue()

  vorpal.hide()
  vorpal.pipe(data => {dataQueue.push(data); console.log(data)})

  t.context = {
    vorpal, dataQueue
  }
})

test('No command', async t => {
  const { vorpal, dataQueue } = t.context

  vorpal.exec('\n')

  console.log('aaa')

  const stdoutLines = await dataQueue.shift(3)

  t.deepEqual(stdoutLines, [
    'Connecting to spacebro server "spacebro.space:3333#clibro-test-ete"...',
    'test-clibro connected to "spacebro.space:3333#clibro-test-ete"',
    undefined
  ])
  t.deepEqual(await dataQueue.shiftAll(), [], "No more lines")
})

/*
test('Use subscribe and unsubscribe', async t => {
  const { stdin, stdoutQueue, stderrQueue, isClosed } = t.context

  t.deepEqual(await stdoutQueue.shift(2), [
    'Connecting to spacebro server "spacebro.space:3333#clibro-test-ete"...',
    'test-clibro connected to "spacebro.space:3333#clibro-test-ete"'
  ])
  t.deepEqual(await stdoutQueue.shiftAll(), [], "No more lines")
  t.deepEqual(await stderrQueue.shiftAll(), [], "No errors")

  stdin.write('subscribe testSub\n')
  stdin.write('subscribe testSub\n')

  const stdoutLines = await stdoutQueue.shift(3)
  delete stdoutLines[0]
  delete stdoutLines[2]
  t.deepEqual(stdoutLines, [
    undefined,
    'Subscribed to event "testSub"',
    undefined
  ])
  t.deepEqual(await stderrQueue.shift(1), [
    '"testSub" already subscribed'
  ])

  spacebro.client.emit('testSub')

  await sleep(50)

  t.deepEqual(await stdoutQueue.shift(1), [
    'New member connected: test-clibro'
  ])
  t.deepEqual(await stdoutQueue.shiftAll(), [], "No more lines")
  t.deepEqual(await stderrQueue.shiftAll(), [], "No errors")

  stdin.write('unsubscribe testSub\n')
  stdin.write('unsubscribe testSub\n')

  const stdoutLines2 = await stdoutQueue.shift(3)
  delete stdoutLines[0]
  delete stdoutLines[2]
  t.deepEqual(stdoutLines2, [
    undefined,
    'Unsubscribed from event "testSub"',
    undefined
  ])
  t.deepEqual(await stderrQueue.shift(1), [
    'Event "testSub" does not exist'
  ])
  t.deepEqual(await stdoutQueue.shiftAll(), [], "No more lines")
  t.deepEqual(await stderrQueue.shiftAll(), [], "No errors")

  stdin.write('exit\n')
  t.is(await isClosed, 0)
})

test.todo('Simple emit')
*/
