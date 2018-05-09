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

module.exports = (client, vorpal) => {
  var module = {
    subscribe: ({ event }, callback) => {
      const warn = vorpal.warn || vorpal.log
      const error = vorpal.error || vorpal.log

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
          vorpal.log(`Received event "${event}" from ${senderName} with ${dataStr}`)
        } catch (e) {
          warn(e)
        }
      })
      subscribedEvents[event] = true
      vorpal.log(`Subscribed to event "${event}"`)
      return callback()
    },
    unsubscribe: ({ event }, callback) => {
      const error = vorpal.error || vorpal.log

      if (reservedEvents.indexOf(event) !== -1) {
        error(`Cannot unsubscribe from reserved event "${event}"`)
        return callback()
      }
      if (!subscribedEvents[event]) {
        error(`Event "${event}" does not exist`)
        return callback()
      }
      client.off(event)
      subscribedEvents[event] = false
      vorpal.log(`Unsubscribed from event "${event}"`)
      return callback()
    },
    emit: ({ event, data, options }, callback) => {
      const error = vorpal.error || vorpal.log
      const dataStr = (data != null) ? `data ${data}` : 'no data'
      let dataObj

      try {
        dataObj = (data != null) ? JSON.parse(data) : data
      } catch (e) {
        error('Parsing Error: data is not valid json')
        return callback()
      }
      if (options.interval && options.stop) {
        error('Error: Cannot use both --interval and --stop in the same command')
        return callback()
      }

      if (options.interval) {
        if (!(options.interval > 0)) {
          error('Error: the interval must be a positive integer')
          return callback()
        }
        if (intervals[event]) {
          error(`Error: "${event}" is already being emitted`)
          return callback()
        }
        intervals[event] = setInterval(
          () => { client.emit(event, dataObj) },
          options.interval * 1000
        )
        vorpal.log(`Emitting event "${event}" every 0.5s with ${dataStr}`)
      } else if (options.stop) {
        if (!intervals[event]) {
          error(`Error: interval "${event}" does not exist`)
          return callback()
        }
        clearInterval(intervals[event])
        delete intervals[event]
        vorpal.log(`Cleared interval for event "${event}"`)
      } else {
        client.emit(event, dataObj)
        vorpal.log(`Emitted event "${event}" with ${dataStr}`)
      }

      return callback()
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
