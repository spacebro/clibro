import test from 'ava'
// import sleep from 'sleep-promise'

import { spawn } from 'child_process'
import readline from 'readline'

test.beforeEach(t => {
  const childProcess = spawn(
    'node', ['index.js', '--settings', 'tests/settings.json'],
    { stdio: 'pipe' }
  )
  const { stdin, stdout, stderr } = childProcess

  const stdoutLines = []
  const rlOut = readline.createInterface({ input: stdout })
  rlOut.on('line', (line) => stdoutLines.push(line))
  const stderrLines = []
  const rlErr = readline.createInterface({ input: stderr })
  rlErr.on('line', (line) => stderrLines.push(line))

  const isClosed = new Promise((resolve, reject) => {
    childProcess.on('close', resolve)
    childProcess.on('error', reject)
  })

  t.context = {
    childProcess,
    stdin, stdout, stderr,
    rlOut, rlErr,
    stdoutLines, stderrLines,
    isClosed
  }
})

test('Simple exit', async t => {
  const { stdin, stdoutLines, stderrLines, isClosed } = t.context

  stdin.write('exit\n')

  const res = await isClosed

  delete stdoutLines[2]
  t.deepEqual(stdoutLines, [
    'Connecting to spacebro server "spacebro.space:3333#clibro-test-ete"...',
    'test-clibro connected to "spacebro.space:3333#clibro-test-ete"',
    undefined
  ])
  t.deepEqual(stderrLines, [])
  t.is(res, 0)
})

test.todo('Use subscribe and unsubscribe')
test.todo('Simple emit')
