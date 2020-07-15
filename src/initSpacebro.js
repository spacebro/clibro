const client = require('spacebro2-client')

function init (config, display) {
  return new Promise((resolve, reject) => {
    const clientStr = `${config.client}`
    const serverStr = `${config.address}:${config.port}#${config.channel}`

    client.setup({
      host: config.address,
      port: config.port,
      client: {
        name: config.client
      }
    })

    display.log(`Connecting to spacebro server "${serverStr}"...`)

    client.on('connect_error', (err) => {
      reject(`Error trying to connect ${clientStr} to "${serverStr}":\n${err}`)
    })
    client.on('connect_timeout', () => {
      reject(`Timed out trying to connect ${clientStr} to "${serverStr}"`)
    })
    client.on('error', (err) => reject(err))

    client.on('new-member', (data) => {
      // not yet implemented
      display.log(`New member connected: ${data.member}`)
    })

    client.on('connected', () => {
      // not yet implemented
      display.log(`${clientStr} connected to "${serverStr}"`)
      resolve(client)
    })
  })
}

module.exports = {
  init
}
