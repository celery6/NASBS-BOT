import { Client, Intents, Collection } from 'discord.js';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { mongoURI, test } from '../../config.json';
import Guild from './Guild.js';
class Bot extends Client {
    test;
    commands;
    guildsData;
    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
            ],
        });
        this.test = test;
        this.commands = new Collection();
        this.guildsData = new Collection();
    }
    async loadDatabase() {
        await mongoose.connect(mongoURI);
    }
    async loadGuilds() {
        const guilds = await Guild.find({}).lean();
        guilds.forEach((guild) => {
            this.guildsData.set(guild.id, guild);
        });
    }
    async loadCommands() {
        const commands = fs.readdirSync(path.resolve(__dirname, '../commands'));
        commands.forEach((cmd) => {
            const command = new (require(`../commands/${cmd}`))(this);
            this.commands.set(command.name, command);
        });
    }
    async loadEvents() {
        const events = fs.readdirSync(path.resolve(__dirname, '../events'));
        events.forEach((file) => {
            const event = require(`../events/${file}`);
            super.on(file.split('.')[0], (...args) => event(this, ...args));
        });
    }
}
export default Bot;
