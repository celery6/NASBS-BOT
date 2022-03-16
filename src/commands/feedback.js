const Command = require('../base/Command')
const Discord = require('discord.js')

class Feedback extends Command {
  constructor(client) {
    super(client, {
      name: 'feedback',
      description: 'Send feedback for a submission.',
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
          description: 'feedback',
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

    const builder = await client.users.fetch(submissionMsg.author.id)
    const dm = await builder.createDM()

    const embed = new Discord.MessageEmbed()
      .setTitle(
        `Here is some feedback for how you can improve your recent build submission!`,
      )
      .setDescription(
        `__[Submission link](${submissionMsg.url})__\nIf you want, use this feedback to improve your build so you can resubmit it for more points!\n\n\`${feedback}\``,
      )

    dm.send({ embeds: [embed] }).catch((err) => {
      return i.reply(
        `${builder} has dms turned off or something went wrong while sending the dm! ${err}`,
      )
    })

    return i.reply('feedback sent :weena!: `' + feedback + '`')
  }
}

module.exports = Feedback
