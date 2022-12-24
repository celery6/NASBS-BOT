const { Client, Intents, Collection } = require('discord.js')
const fs = require('fs')
const mongoose = require('mongoose')
const path = require('path')
const { mongoURI, test } = require('../../config.json')
const Guild = require('./Guild')
const User = require('./User')

class Bot extends Client {
  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
      ],
    })
    this.test = test
    this.commands = new Collection()
    this.guildsData = new Collection()
    this.userCache = new Collection()
  }

  async loadDatabase() {
    await mongoose.connect(mongoURI)
    this.mongo = mongoose
  }

  async loadGuilds() {
    const guilds = await Guild.find({}).lean()
    guilds.forEach((guild) => {
      this.guildsData.set(guild.id, guild)
    })
  }

  async getOrAddUser(userId) {
    // if user is not cached in client, get it from db and add to cache
    if (!this.userCache.get(userId)) {
      const userData = await User.findOne({ id: userId }).lean()
      // if user has never built anything, return
      if (!userData) {
        return false
      } else {
        this.userCache.set(userData.id, {
          dm: userData.dm || true,
        })
      }
    }
    return this.userCache.get(userId)
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
