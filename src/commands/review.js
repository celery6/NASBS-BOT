const Command = require('../base/Command')
const Submission = require('../base/Submission')
const User = require('../base/User')
const {
  globalArgs,
  oneArgs,
  manyArgs,
  landArgs,
  roadArgs,
} = require('../review/options')
const rankup = require('../review/rankup')
const Discord = require('discord.js')

class Review extends Command {
  constructor(client) {
    super(client, {
      name: 'review',
      description: 'review builds.',
      reviewer: true,
      subCommands: [
        {
          name: 'one',
          description: 'Review one building.',
          args: [...globalArgs.slice(0, 1), ...oneArgs, ...globalArgs.slice(1)],
        },
        {
          name: 'many',
          description: 'Review multiple buildings.',
          args: [
            ...globalArgs.slice(0, 1),
            ...manyArgs,
            ...globalArgs.slice(1),
          ],
        },
        {
          name: 'land',
          description: 'Review land.',
          args: [
            ...globalArgs.slice(0, 1),
            ...landArgs,
            ...globalArgs.slice(1),
          ],
        },
        {
          name: 'road',
          description: 'Review road',
          args: [
            ...globalArgs.slice(0, 1),
            ...roadArgs,
            ...globalArgs.slice(1),
          ],
        },
      ],
    })
  }

  async run(i) {
    const client = this.client
    const guildData = client.guildsData.get(i.guild.id)
    const options = i.options
    const submitChannel = await client.channels.fetch(guildData.submitChannel)
    const submissionId = await options.getString('submissionid')
    let submissionMsg

    try {
      submissionMsg = await submitChannel.messages.fetch(submissionId)
    } catch (e) {
      return i.reply(
        `'${submissionId}' is not a valid message ID from the build submit channel!`,
      )
    }

    if (submissionMsg.author.id == i.user.id) {
      return i.reply(
        'you cannnot review your own builds <:bonk:720758421514878998>',
      )
    }

    await i.reply('doing stuff...')
    // set variables shared by all subcommands
    const userId = submissionMsg.author.id
    const bonus = options.getInteger('bonus') || 1
    const collaborators = options.getInteger('collaborators') || 1
    const edit = options.getBoolean('edit') || false
    let pointsTotal
    let increment

    let submissionData = {
      _id: submissionId,
      guildId: i.guild.id,
      userId: userId,
      collaborators: collaborators,
      bonus: bonus,
      edit: edit,
      submissionTime: submissionMsg.createdTimestamp,
      reviewTime: i.createdTimestamp,
      reviewer: i.user.id,
    }

    // review function used by all subcommands
    async function review(reply, data, countType, countValue) {
      try {
        if (edit) {
          if (submissionMsg.reactions.cache.has('✅')) {
            if (
              !submissionMsg.reactions.cache
                .get('✅')
                .users.cache.has('718691006328995890')
            ) {
              return i.followUp(
                'that one hasnt been graded <:bonk:720758421514878998>!',
              )
            }
          }
          // get change in points from original submission, update user's total points
          const original = await Submission.findOne({
            _id: submissionId,
          }).lean()
          increment = pointsTotal - original.pointsTotal

          await User.updateOne(
            { id: userId, guildId: i.guild.id },
            { $inc: { pointsTotal: increment } },
            { upsert: true },
          ).lean()

          i.followUp(`EDITED ${reply}`)
        } else {
          if (submissionMsg.reactions.cache.has('✅')) {
            if (
              submissionMsg.reactions.cache
                .get('✅')
                .users.cache.has('718691006328995890')
            ) {
              return i.followUp(
                'that one already got graded <:bonk:720758421514878998>!',
              )
            }
          }

          // increment user's total points and building count/sqm/roadKMs
          await User.updateOne(
            { id: userId, guildId: i.guild.id },
            {
              $inc: {
                pointsTotal: parseFloat(pointsTotal),
                [countType]: countValue,
              },
            },
            { upsert: true },
          ).lean()

          // send dm if user has it enabled
          const userData = await client.getOrAddUser(userId)

          if (!userData || userData.dm == true) {
            const member = await i.guild.members.fetch(userId)
            const dm = await member.createDM()
            await dm
              .send({
                embeds: [
                  new Discord.MessageEmbed()
                    .setTitle(
                      `${guildData.emoji} Build reviewed! ${guildData.emoji}`,
                    )
                    .setDescription(`You ${reply}`)
                    .setFooter({
                      text: `Use the cmd '/preferences' to toggle build review DMs.`,
                    }),
                ],
              })
              .catch((err) => {
                console.log(err)
                i.followUp(
                  `${i.user} has dms turned off or something went wrong while sending the dm! ${err}`,
                )
              })
          }

          // insert submission doc
          await Submission.updateOne({ _id: submissionId }, data, {
            upsert: true,
          }).lean()

          await submissionMsg.react('✅')
          await i.followUp(
            `SUCCESS YAY!!!<:HAOYEEEEEEEEEEAH:908834717913186414>\n\n<@${userId}> has ${reply}`,
          )
        }
      } catch (err) {
        console.log(err)
        i.followUp('ERROR HAPPENED! ' + err)
      }

      try {
        // get new point total for the user in order to check for rankup
        const current = await User.findOne({
          id: userId,
          guildId: i.guild.id,
        }).lean()

        await rankup(submissionMsg.member, current.pointsTotal, guildData, i)
      } catch (err) {
        console.log(err)
        i.followUp(`RANKUP ERROR HAPPENED! ${err}`)
      }
    }

    // subcommands
    if (i.options.getSubcommand() == 'one') {
      // set subcmd-specific variables
      const size = options.getInteger('size')
      const quality = options.getNumber('quality')
      const complexity = options.getNumber('complexity')
      pointsTotal = (size * quality * complexity * bonus) / collaborators
      submissionData = {
        ...submissionData,
        submissionType: 'ONE',
        size: size,
        quality: quality,
        complexity: complexity,
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nBuilding type: ${size}\nQuality multiplier: x${quality}\nComplexity multiplier: x${complexity}\nBonuses: x${bonus}\nCollaborators: ${collaborators}\n[Link](${submissionMsg.url})`,
        submissionData,
        'buildingCount',
        1,
      )
    } else if (i.options.getSubcommand() == 'many') {
      const smallAmt = options.getInteger('smallamt')
      const mediumAmt = options.getInteger('mediumamt')
      const largeAmt = options.getInteger('largeamt')
      const quality = options.getNumber('avgquality')
      const complexity = options.getNumber('avgcomplexity')
      pointsTotal =
        (smallAmt * 2 + mediumAmt * 5 + largeAmt * 10) *
        quality *
        complexity *
        bonus

      submissionData = {
        ...submissionData,
        smallAmt: smallAmt,
        mediumAmt: mediumAmt,
        largeAmt: largeAmt,
        quality: quality,
        complexity: complexity,
        submissionType: 'MANY',
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nNumber of buildings (S/M/L): ${smallAmt}/${mediumAmt}/${largeAmt}\nQuality multiplier: x${quality}\nComplexity multiplier: x${complexity}\nBonuses: x${bonus}\n[Link](${submissionMsg.url})`,
        submissionData,
        'buildingCount',
        smallAmt + mediumAmt + largeAmt,
      )
    } else if (i.options.getSubcommand() == 'land') {
      const sqm = options.getNumber('sqm')
      const landtype = options.getInteger('landtype')
      const quality = options.getInteger('quality')
      const complexity = options.getNumber('complexity')
      pointsTotal =
        (sqm * landtype * complexity * quality * bonus) / 50000 / collaborators
      submissionData = {
        ...submissionData,
        sqm: sqm,
        complexity: complexity,
        submissionType: 'LAND',
        quality: quality,
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nLand area: ${sqm} sqm\nQuality multiplier: x${quality}\nComplexity multiplier: x${complexity}\nBonuses: x${bonus}\nCollaborators: ${collaborators}\n[Link](${submissionMsg.url})`,
        submissionData,
        'sqm',
        sqm,
      )
    } else if (i.options.getSubcommand() == 'road') {
      const roadType = options.getNumber('roadtype')
      const roadKMs = options.getNumber('distance')
      const quality = options.getInteger('quality')
      const complexity = options.getNumber('complexity')
      pointsTotal =
        (roadType * roadKMs * complexity * quality * bonus) / collaborators
      submissionData = {
        ...submissionData,
        roadType: roadType,
        roadKMs: roadKMs,
        complexity: complexity,
        submissionType: 'ROAD',
        quality: quality,
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nRoad type: ${roadType}\nQuality multiplier: x${quality}\nComplexity multiplier: x${complexity}\nDistance: ${roadKMs} km\nBonuses: x${bonus}\nCollaborators: ${collaborators}\n[Link](${submissionMsg.url})`,
        submissionData,
        'roadKMs',
        roadKMs,
      )
    }
  }
}

module.exports = Review
