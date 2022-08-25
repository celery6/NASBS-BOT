const Command = require('../base/Command')
const Discord = require('discord.js')
const { checkIfAccepted, checkIfRejected } = require('../common/utils.js')

class Decline extends Command {
  constructor(client) {
    super(client, {
      name: 'decline',
      description: 'Decline a submission.',
      reviewer: true,
      args: [
        {
          name: 'submissionid',
          description: 'Msg id of the submission',
          required: true,
          optionType: 'string',
        },
        {
          name: 'feedback',
          description: 'feedback / reason for decline',
          required: true,
          optionType: 'string',
        },
      ],
    })
  }

  async run(i) {
    const options = i.options
    const client = this.client
    const guild = client.guildsData.get(i.guild.id)
    const submissionId = options.getString('submissionid')
    const feedback = options.getString('feedback')
    const submitChannel = await client.channels.fetch(guild.submitChannel)

    let submissionMsg

    try {
      submissionMsg = await submitChannel.messages.fetch(submissionId)
    } catch (e) {
      return i.reply(
        `'${submissionId}' is not a valid message ID from the build submit channel!`,
      )
    }

    // Check if it already got graded
    const isAccepted = await checkIfAccepted(submissionMsg)
    if (isAccepted) {
      return i.reply('that one already got graded <:bonk:720758421514878998>! Use `/purge` instead')
    }

    // Check if it already got declined / purged
    const isRejected = await checkIfRejected(submissionMsg)
    if (isRejected) {
      return i.reply('that one has already been rejected <:bonk:720758421514878998>!')
    }

    const builder = await client.users.fetch(submissionMsg.author.id)
    const dm = await builder.createDM()

    const embed = new Discord.MessageEmbed()
      .setTitle(`Your recent build submission has been declined.`)
      .setDescription(
        `__[Submission link](${submissionMsg.url})__\nYou can use this feedback to improve your build then resubmit it to gain points!\n\n\`${feedback}\``,
      )

    dm.send({ embeds: [embed] }).catch((err) => {
      return i.reply(
        `${builder} has dms turned off or something went wrong while sending the dm! ${err}`,
      )
    })

    await submissionMsg.react('❌')
    return i.reply('rejected and feedback sent :weena!: `' + feedback + '`')
  }
}

module.exports = Decline
