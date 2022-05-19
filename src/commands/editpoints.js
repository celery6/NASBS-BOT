const Command = require('../base/Command')
const User = require('../base/User')
const Discord = require('discord.js')

class EditPoints extends Command {
  constructor(client) {
    super(client, {
      name: 'editpoints',
      description: 'Manually edit a users points',
      reviewer: true,
      args: [
        {
          name: 'user',
          description: `The user whos points will be altered`,
          required: true,
          optionType: 'user',
        },
        {
          name: 'amount',
          description: `The number of points to add or subtract (positive or negative values)`,
          required: true,
          optionType: 'number',
        },
      ],
    })
  }

  async run(i) {
    const options = i.options
    const guild = this.client.guildsData.get(i.guild.id)
    const user = options.getUser('user')
    const userId = user.id
    const amount = options.getNumber('amount')

    const userData = await User.findOne({
      id: userId,
      guildId: guild.id,
    }).lean()

    // return if user is not in db
    if (!userData) {
      return i.reply({
        embeds: [
          new Discord.MessageEmbed().setDescription(
            `<@${userId}> has not gained any points yet :frowning2: <:sad_cat:873457028981481473>`,
          ),
        ],
      })
    }

    // increments users team points by the amount inputted
    await User.updateOne(
      { id: userId, guildId: i.guild.id },
      {
        $inc: {
          pointsTotal: amount,
        },
      },
      { upsert: true },
    ).lean()

    i.reply(`ok updated ${user}'s points by ${amount}`)
  }
}

module.exports = EditPoints
