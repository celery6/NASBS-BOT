const { Client, Intents, Collection } = require('discord.js')
const fs = require('fs')
const mongoose = require('mongoose')
const path = require('path')
const { mongoURI } = require('../../config.json')
const Guild = require('./Guild')

class Bot extends Client {
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
      ],
    })
    this.commands = new Collection()
    this.guildsData = new Collection()
  }

  async loadDatabase() {
    await mongoose.connect(mongoURI)
    this.mongo = mongoose
  }

  async loadGuilds() {
    const guilds = await Guild.find({})
    guilds.forEach((guild) => {
      this.guildsData.set(guild.id, guild)
    })
  }

  async loadCommands() {
    const commands = fs.readdirSync(path.resolve(__dirname, '../commands'))
    commands.forEach((cmd) => {
      const command = new (require(`../commands/${cmd}`))(this)
      this.commands.set(command.name, command)
    })
  }

  async loadEvents() {
    const events = fs.readdirSync(path.resolve(__dirname, '../events'))
    events.forEach((file) => {
      const event = require(`../events/${file}`)
      super.on(file.split('.')[0], (...args) => event(this, ...args))
    })
  }
}

module.exports = Bot
