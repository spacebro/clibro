const client = require('spacebro-client')

function init (config, display) {
  return new Promise((resolve, reject) => {
    const clientStr = `${config.client}`
    const serverStr = `${config.address}:${config.port}#${config.channel}`

    display.log(`Connecting to spacebro server '${serverStr}'...`)

    client.connect(config.address, config.port, {
      clientName: config.client,
      channelName: config.channel,
      verbose: false
    })

    client.on('connect_error', (err) => {
      reject(`Error trying to connect ${clientStr} to '${serverStr}':\n${err}`)
    })
    client.on('connect_timeout', () => {
      reject(`Timed out trying to connect ${clientStr} to '${serverStr}'`)
    })
    client.on('error', (err) => reject(err))

    client.on('new-member', (data) => {
      display.log(`New member connected: ${data.member}`)
    })

    client.on('connect', () => {
      display.log(`${clientStr} connected to '${serverStr}'`)
      resolve(client)
    })
  })
}

module.exports = {
  client,
  init
}
