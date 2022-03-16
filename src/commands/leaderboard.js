const { MessageActionRow, MessageButton } = require('discord.js')
const Command = require('../base/Command')
const User = require('../base/User')
const Discord = require('discord.js')

class Leaderboard extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      description: 'Points leaderboard!',
      args: [
        {
          name: 'global',
          description: `Show NASBS leaderboard for all teams`,
          required: false,
          optionType: 'boolean',
        },
      ],
    })
  }

  async run(i) {
    const guild = this.client.guildsData.get(i.guild.id)
    const options = i.options
    const pageLength = 10
    let page = 1
    let users
    let guildName

    if (options.getBoolean('global')) {
      guildName = 'all build teams'
      // get array of all users and their global points, sort descending
      users = await User.aggregate([
        {
          $group: {
            _id: '$id',
            pointsTotal: { $sum: '$pointsTotal' },
          },
        },
        { $sort: { pointsTotal: -1 } },
      ])
    } else {
      guildName = guild.name
      // or get array of all users in this guild and their points, sort descending
      users = await User.aggregate([
        { $match: { guildId: guild.id } },
        {
          $group: {
            _id: '$id',
            pointsTotal: { $sum: '$pointsTotal' },
          },
        },
        { $sort: { pointsTotal: -1 } },
      ])
    }

    const maxPage = Math.ceil(users.length / pageLength)

    // make buttons
    const previousButton = new MessageButton()
      .setCustomId('previous')
      .setLabel('Previous page')
      .setStyle('PRIMARY')

    const nextButton = new MessageButton()
      .setCustomId('next')
      .setLabel('Next page')
      .setStyle('PRIMARY')

    // create the embed for any page of leaderboard
    function makeEmbed(page) {
      let content = ''

      for (let i = page * pageLength - pageLength; i < page * pageLength; i++) {
        if (!users[i]) break
        content += `**${i + 1}.** <@${users[i]._id}>: ${parseFloat(
          users[i].pointsTotal,
        ).toFixed(1)}\n\n`
      }

      const embed = new Discord.MessageEmbed()
        .setTitle(`Points leaderboard for ${guildName}!`)
        .setDescription(content)

      return embed
    }

    // reply with page 1 and next button
    // if there's only 1 leaderboard page, no buttons
    if (maxPage == 1) {
      await i.reply({
        embeds: [makeEmbed(page)],
      })
    } else {
      // otherwise, add a next button
      await i.reply({
        embeds: [makeEmbed(1)],
        components: [new MessageActionRow().addComponents(nextButton)],
      })
    }

    const replyMsg = await i.fetchReply()
    const filter = (button) =>
      button.customId == 'previous' || button.customId == 'next'

    // listen for button pressed
    function buttonListener() {
      replyMsg
        .awaitMessageComponent({
          filter,
          time: 12 * 60 * 60 * 1000,
        })
        // when button is pressed, update the embed and page value accordingly, then start another listener
        .then(async (i) => {
          if (i.customId == 'previous') {
            page -= 1
            // no previous button allowed if its the 1st page
            if (page == 1) {
              await i.update({
                embeds: [makeEmbed(page)],
                components: [new MessageActionRow().addComponents(nextButton)],
              })
            } else {
              await i.update({
                embeds: [makeEmbed(page)],
                components: [
                  new MessageActionRow().addComponents(
                    previousButton,
                    nextButton,
                  ),
                ],
              })
            }
          } else if (i.customId == 'next') {
            page += 1
            // no next button allowed if its the last page
            if (page == maxPage) {
              await i.update({
                embeds: [makeEmbed(page)],
                components: [
                  new MessageActionRow().addComponents(previousButton),
                ],
              })
            } else {
              await i.update({
                embeds: [makeEmbed(page)],
                components: [
                  new MessageActionRow().addComponents(
                    previousButton,
                    nextButton,
                  ),
                ],
              })
            }
          }
          buttonListener(replyMsg)
        })
        .catch((err) => {
          return err
        })
    }
    buttonListener()
  }
}

module.exports = Leaderboard
