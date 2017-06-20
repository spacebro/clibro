const spacebroClient = require('./initSpacebro').client

const intervals = {}
const subscribedEvents = {}

function subscribe ({ event }, callback) {
  if (!subscribedEvents[event]) {
    spacebroClient.on(event, (data) => {
      try {
        const dataObj = data
        const senderName = data._from

        if (typeof dataObj === 'object') {
          delete dataObj._to
          delete dataObj._from
        }
        const dataStr = JSON.stringify(data)

        if (typeof dataObj === 'object' && Object.keys(dataObj).length === 0) {
          this.log(`Received event "${event}" from ${senderName} with no data`)
        } else {
          this.log(`Received event "${event}" from ${senderName} with data ${dataStr}`)
        }
      } catch (e) {
        this.warn(e)
      }
    })
    subscribedEvents[event] = true
    this.log(`Subscribed to event "${event}"`)
    return callback()
  } else {
    this.warn(`"${event}" already subscribed`)
    return callback()
  }
}

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

function unsubscribe ({ event }, callback) {
  if (subscribedEvents[event]) {
    spacebroClient.off(event)
    subscribedEvents[event] = false
    this.log(`Unsubscribed from event "${event}"`)
  } else if (reservedEvents.indexOf(event) !== -1) {
    this.error(`Cannot unsubscribe from reserved event "${event}"`)
  } else {
    this.error(`Event "${event}" does not exist`)
  }
  return callback()
}

function emit ({ event, data, options }, callback) {
  const dataStr = (data != null) ? `data ${data}` : 'no data'

  if (options.interval) {
    if (options.interval > 0) {
      intervals[event] = setInterval(
        () => { spacebroClient.emit(event, data) },
        options.interval * 1000
      )
      this.log(`Emitting event "${event}" every 0.5s with ${dataStr}`)
    }
    else {
      this.error('Error: the interval must be a positive integer')
    }
  }

  else if (options.stop) {
    if (intervals[event]) {
      clearInterval(intervals[event])
      delete intervals[event]
      this.log(`Cleared interval for event "${event}"`)
    } else {
      this.error(`Error: interval "${event}" does not exist`)
    }
  }

  else {
    spacebroClient.emit(event, data)
    this.log(`Emitted event "${event}" with ${dataStr}`)
  }

  return callback()
}

module.exports = {
  subscribe,
  unsubscribe,
  emit
}
