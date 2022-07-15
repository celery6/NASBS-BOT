const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { token, clientId } = require('../config.json')
const fs = require('fs')
const path = require('path')
const dirPath = path.resolve(__dirname, './commands')

const commands = []
const commandFiles = fs
  .readdirSync(dirPath)
  .filter((file) => file.endsWith('.js'))

// Place your client and guild ids here
const testingGuild = '935926834019844097'

for (const file of commandFiles) {
  const Command = require(`./commands/${file}`)
  const command = new Command()
  commands.push(command.getData())
}

const rest = new REST({ version: '9' }).setToken(token)

;(async () => {
  try {
    console.log('Started refreshing application guild (/) commands.')

    await rest.put(Routes.applicationGuildCommands(clientId, testingGuild), {
      body: commands,
    })

    console.log('Successfully reloaded application guild (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
;(async () => {
  try {
    console.log('Started refreshing global application (/) commands.')

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    })

    console.log('Successfully reloaded global application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
