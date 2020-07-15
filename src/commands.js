const intervals = {}
const subscribedEvents = {}

const reservedEvents = [
  'connect',
  'new-member',
  'connect_error',
  'connect_timeout',
  'error',
  'disconnect',
  'reconnect',
  'reconnect_attempt',
  'reconnecting',
  'reconnect_error',
  'reconnect_failed'
]

module.exports = (client, cli) => {
  const warn = cli.warn || cli.log
  const error = cli.error || cli.log

  var module = {
    subscribe: ({ event }) => {
      if (subscribedEvents[event]) {
        warn(`"${event}" already subscribed`)
        return callback()
      }
      if (reservedEvents.indexOf(event) !== -1) {
        error(`Cannot subscribe to reserved event "${event}"`)
        return callback()
      }
      client.on(event, (data) => {
        const dataObj = data
        const senderName = data._from

        if (typeof dataObj === 'object') {
          delete dataObj._to
          delete dataObj._from
        }
        try {
          let dataStr

          if (typeof dataObj === 'object' && Object.keys(dataObj).length === 0) {
            dataStr = 'no data'
          } else {
            dataStr = JSON.stringify(data)
          }
          cli.log(`Received event "${event}" from ${senderName} with ${dataStr}`)
        } catch (e) {
          warn(e)
        }
      })
      subscribedEvents[event] = true
      cli.log(`Subscribed to event "${event}"`)
    },
    unsubscribe: ({ event }) => {
      if (reservedEvents.indexOf(event) !== -1) {
        error(`Cannot unsubscribe from reserved event "${event}"`)
        return
      }
      if (!subscribedEvents[event]) {
        error(`Event "${event}" does not exist`)
        return
      }
      client.off(event)
      subscribedEvents[event] = false
      cli.log(`Unsubscribed from event "${event}"`)
    },
    emit: ({ event, data, options }, callback) => {
      const dataStr = (data != null) ? `data ${data}` : 'no data'
      let dataObj

      try {
        dataObj = (data != null) ? JSON.parse(data) : data
      } catch (e) {
        error('Parsing Error: data is not valid json')
        return
      }
      if (options.interval && options.stop) {
        error('Error: Cannot use both --interval and --stop in the same command')
        return
      }

      if (options.interval) {
        if (!(options.interval > 0)) {
          error('Error: the interval must be a positive integer')
          return
        }
        if (intervals[event]) {
          error(`Error: "${event}" is already being emitted`)
          return
        }
        intervals[event] = setInterval(
          () => { client.emit(event, dataObj) },
          options.interval * 1000
        )
        cli.log(`Emitting event "${event}" every 0.5s with ${dataStr}`)
      } else if (options.stop) {
        if (!intervals[event]) {
          error(`Error: interval "${event}" does not exist`)
          return
        }
        clearInterval(intervals[event])
        delete intervals[event]
        cli.log(`Cleared interval for event "${event}"`)
      } else {
        client.emit(event, dataObj)
        cli.log(`Emitted event "${event}" with ${dataStr}`)
      }
    },
    resetAll: () => {
      for (const event of Object.keys(subscribedEvents)) {
        client.off(event)
        delete subscribedEvents[event]
      }
      for (const event of Object.keys(intervals)) {
        clearInterval(intervals[event])
        delete intervals[event]
      }
    }
  }
  return module
}
