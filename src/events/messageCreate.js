const Discord = require('discord.js')

async function execute(client, msg) {
  if (msg.author.bot) return
  if (client.test || (!client.test && msg.guild.id == '935926834019844097'))
    return

  const guild = client.guildsData.get(msg.guild.id)
  if (!guild) return

  // check for correct formatting for all messages in build-submit channel
  if (msg.channel.id == guild.submitChannel) {
    // check for images
    if (msg.attachments.size === 0) {
      return reject(client, msg, guild)
    }

    // ensure there are at least 2 lines (# and coords)
    const lines = msg.content.split('\n')
    if (lines.length < 2) {
      return reject(client, msg, guild)
    }

    const regexExp =
      /^\s*[(]?[-+]?([1-8]+\d\.(\d+)?|90(\.0+))\xb0?,?\s+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]+\d))\.(\d+))\xb0?\s*/
    let coords = false
    let count = false

    // check content of each line for either count (including range x-z) or coords
    lines.forEach((line) => {
      line = line.replace(/#/g, '')
      if (regexExp.test(line) === true) {
        coords = true
      } else if (!isNaN(line) && Number.isInteger(Number(line))) {
        count = true
      } else if (
        line.includes('-') &&
        line.split('-').length === 2 &&
        !isNaN(line.replace('-', ''))
      ) {
        count = true
      }
    })

    // reject submission if it doesn't include coords or a count
    if (coords !== true || count !== true) {
      reject(client, msg, guild)
    }
  }
}

async function reject(client, msg, guild) {
  const embed = new Discord.MessageEmbed()
    .setTitle(`INCORRECT SUBMISSION FORMAT.`)
    .setDescription(
      `**[Correct format:](${guild.formattingMsg})**\n[Build count]\n[Coordinates]\n[Location name] (OPTIONAL)\n[Image(s) of build]\n\n__The entire submission must be in ONE MESSAGE!__\nView [pinned message](${guild.formattingMsg}) for more details.`,
    )

  const rejectionMsg = await msg.channel.send({ embeds: [embed] })

  setTimeout(() => {
    rejectionMsg.delete()
    msg.delete()
  }, 30000)
}

module.exports = execute
