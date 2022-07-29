const Command = require('../base/Command')
const User = require('../base/User')
const Submission = require('../base/Submission')
const Discord = require('discord.js')

class Die extends Command {
  constructor(client) {
    super(client, {
      name: 'die',
      description: 'die',
      reviewer: true,
      args: [
        {
          name: 'submissionid',
          description: 'Msg id of the submission to add complexity to',
          required: true,
          optionType: 'string',
        },
        {
          name: 'complexity',
          description: `Complexity to add`,
          required: true,
          optionType: 'number',
        },
      ],
    })
  }

  async run(i) {
    const client = this.client
    const guildData = client.guildsData.get(i.guild.id)
    const options = i.options
    const guild = this.client.guildsData.get(i.guild.id)
    const complexity = options.getNumber('complexity')

    const submitChannel = await client.channels.fetch(guildData.submitChannel)
    const submissionId = await options.getString('submissionid')
    let submissionMsg

    try {
      // check if the submission msg is valid and already graded
      submissionMsg = await submitChannel.messages.fetch(submissionId)
    } catch (e) {
      return i.reply(
        `'${submissionId}' is not a valid message ID from the build submit channel!`,
      )
    }

    // check submission is graded or not
    if (!submissionMsg.reactions.cache.has('✅')) {
      return i.reply(
        'that one hasnt been graded yet <:bonk:720758421514878998>!',
      )
    } else if (submissionMsg.reactions.cache.has('✅')) {
      if (
        !submissionMsg.reactions.cache
          .get('✅')
          .users.cache.has('718691006328995890') &&
        !submissionMsg.reactions.cache
          .get('✅')
          .users.cache.has('841771725266878476')
      ) {
        return i.followUp(
          'that one hasnt been graded <:bonk:720758421514878998>!',
        )
      }
    }

    if (submissionMsg.author.id == i.user.id) {
      return i.reply(
        'you cannnot review your own builds <:bonk:720758421514878998>',
      )
    }

    const userId = submissionMsg.author.id

    // check if user is in db
    const userData = await User.findOne({
      id: userId,
      guildId: guild.id,
    }).lean()

    if (!userData) {
      return i.reply({
        embeds: [
          new Discord.MessageEmbed().setDescription(
            `<@${userId}> has not gained any points yet :frowning2: <:sad_cat:873457028981481473>`,
          ),
        ],
      })
    }

    // get change in points from original submission, update user's total points
    const original = await Submission.findOne({
      _id: submissionId,
    }).lean()

    // calculate new pointstotal based on previous pointstotal and complexity
    const pointsTotal =
      (original.pointsTotal / original.complexity) * complexity
    const increment = pointsTotal - original.pointsTotal

    // update submission doc pointstotal and complexity
    await Submission.updateOne(
      { _id: submissionId, guildId: i.guild.id },
      { pointsTotal: pointsTotal, complexity: complexity },
    ).lean()

    // update user doc pointstotal
    await User.updateOne(
      { id: userId, guildId: i.guild.id },
      { $inc: { pointsTotal: increment } },
      { upsert: true },
    ).lean()

    i.reply(
      `ok added ${complexity} complexity to <@${userId}>'s build. [Link](${submissionMsg.url}). DIE!`,
    )
  }
}

module.exports = Die
