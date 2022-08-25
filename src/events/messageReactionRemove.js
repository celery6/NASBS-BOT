const Client = require('../base/Client.js')
const { MessageReaction, User } = require('discord.js')
const Submission = require('../base/Submission.js')
const { clientId } = require('../../config.json')

/**
 * When the bot's ✅ reaction is removed from a submission, add the reaction back if the submission is still in the database
 * @param {Client} client 
 * @param {MessageReaction} reaction 
 * @param {User} user 
 * @returns 
 */
async function execute(client, reaction, user) {
  let submissionMsg = reaction.message
  if (submissionMsg.partial) {
    try {
      submissionMsg = await submissionMsg.fetch()
    } catch (error) {
      return
    }
  }

  const guild = submissionMsg.guild
  if (!guild) {
    return
  }
  if (
    (!client.test && guild.id == '935926834019844097') ||
    (client.test && guild.id != '935926834019844097')
  )
    return

  const guildData = client.guildsData.get(guild.id)
  if (!guildData) {
    return
  }

  if (user.id === clientId && reaction.emoji.name === '✅') {
    const submission = await Submission.findOne({
      _id: submissionMsg.id,
    }).lean()

    if (submission) {
      console.log(`✅ reaction was removed from ${submissionMsg.url}. Adding it back because the submission is still in the database`)
      await submissionMsg.react('✅')
    }
  }
}

module.exports = execute
