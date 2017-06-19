const spacebroClient = require('./initSpacebro').client

const intervals = {}

function subscribe ({ event }, callback) {
  spacebroClient.on(event, (data) => {
    try {
      data = JSON.stringify(data)
    } catch (e) {
      this.warn(e)
    }
    this.log(`Received event "${event}" with data ${data}`)
  })
  this.log(`Subscribed to event "${event}"`)
  return callback()
}

function unsubscribe ({ event }, callback) {
  spacebroClient.off(event)
  this.log(`Unsubscribed from event "${event}"`)
  return callback()
}

function emit ({ event, data, options }, callback) {
  if (options.stop) {
    clearInterval(intervals[event])
    this.log(`Cleared interval for event "${event}"`)
  } else if (options.interval) {
    if (isNaN(options.interval)) {
      this.error('Error: the interval must be a positive integer')
      return callback()
    }
    let interval = setInterval(() => {
      spacebroClient.emit(event, data)
    }, options.interval * 1000)
    intervals[event] = interval
  } else {
    spacebroClient.emit(event, data)
    this.log(`Emitted event "${event}" with data ${data}`)
  }
  return callback()
}

module.exports = {
  subscribe,
  unsubscribe,
  emit
}
