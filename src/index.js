const Client = require('./base/Client')
const config = require('../config.json')

const client = new Client()

console.log('starting..')

client.login(config.token)
client.loadCommands()
client.loadEvents()
client.loadDatabase()

console.log('here')
