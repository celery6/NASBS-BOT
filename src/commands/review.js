const Command = require('../base/Command')
const Submission = require('../base/Submission')
const User = require('../base/User')
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
      const original =
        (await User.findOne({ id: userId, guildId: i.guild.id }).lean()) || 0

      if (edit) {
        if (!submissionMsg.reactions.cache.has('✅')) {
          return i.followUp(
            'that one hasnt been graded <:bonk:720758421514878998>!',
          )
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
          return i.followUp(
            'that one already got graded <:bonk:720758421514878998>!',
          )
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
                    text: `Use the cmd '/preferences' to toggle on/off build review DMs.`,
                  }),
              ],
            })
            .catch((err) => {
              i.followUp(
                `${i.user} has dms turned off or something went wrong while sending the dm! ${err}`,
              )
            })
        }

        await submissionMsg.react('✅')
        await i.followUp(
          `SUCCESS YAY!!!<:HAOYEEEEEEEEEEAH:908834717913186414>\n\n<@${userId}> has ${reply}`,
        )
      }
      await rankup(
        submissionMsg.member,
        original.pointsTotal || 0,
        pointsTotal,
        i,
        guildData,
      )

      await Submission.updateOne({ _id: submissionId }, data, {
        upsert: true,
      }).lean()
    }

    // subcommands
    if (i.options.getSubcommand() == 'one') {
      // set subcmd-specific variables
      const size = options.getInteger('size')
      const quality = options.getNumber('quality')
      pointsTotal = (size * quality * bonus) / collaborators
      submissionData = {
        ...submissionData,
        submissionType: 'ONE',
        size: size,
        quality: quality,
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nBuilding type: ${size}\nQuality multiplier: x${quality}\nBonuses: x${bonus}\nCollaborators: ${collaborators}\n[Link](${submissionMsg.url})`,
        submissionData,
        'buildingCount',
        1,
      )
    } else if (i.options.getSubcommand() == 'many') {
      const smallAmt = options.getInteger('smallamt')
      const mediumAmt = options.getInteger('mediumamt')
      const largeAmt = options.getInteger('largeamt')
      const quality = options.getNumber('avgquality')
      pointsTotal =
        (smallAmt * 2 + mediumAmt * 5 + largeAmt * 10) * quality * bonus
      submissionData = {
        ...submissionData,
        smallAmt: smallAmt,
        mediumAmt: mediumAmt,
        largeAmt: largeAmt,
        quality: quality,
        submissionType: 'MANY',
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nNumber of buildings (S/M/L): ${smallAmt}/${mediumAmt}/${largeAmt}\nQuality multiplier: x${quality}\nBonuses: x${bonus}\n[Link](${submissionMsg.url})`,
        submissionData,
        'buildingCount',
        smallAmt + mediumAmt + largeAmt,
      )
    } else if (i.options.getSubcommand() == 'land') {
      const sqm = options.getNumber('sqm')
      const complexity = options.getNumber('complexity')
      pointsTotal = (10 * sqm * complexity * bonus) / 50000 / collaborators
      submissionData = {
        ...submissionData,
        sqm: sqm,
        complexity: complexity,
        submissionType: 'LAND',
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nLand area: ${sqm} sqm\nComplexity multiplier: x${complexity}\nBonuses: x${bonus}\nCollaborators: ${collaborators}\n[Link](${submissionMsg.url})`,
        submissionData,
        'sqm',
        sqm,
      )
    } else if (i.options.getSubcommand() == 'road') {
      const roadType = options.getNumber('roadtype')
      const roadKMs = options.getNumber('distance')
      const complexity = options.getNumber('complexity')
      pointsTotal = (roadType * roadKMs * complexity * bonus) / collaborators
      submissionData = {
        ...submissionData,
        roadType: roadType,
        roadKMs: roadKMs,
        complexity: complexity,
        submissionType: 'ROAD',
        pointsTotal: pointsTotal,
      }

      return review(
        `gained **${pointsTotal} points!!!**\n\n*__Points breakdown:__*\nRoad type: ${roadType}\nComplexity multiplier: x${complexity}\nDistance: ${roadKMs} km\nBonuses: x${bonus}\nCollaborators: ${collaborators}\n[Link](${submissionMsg.url})`,
        submissionData,
        'roadKMs',
        roadKMs,
      )
    }
  }
}

module.exports = Review

async function rankup(member, originalPoints, newPoints, i, guild) {
  if (
    originalPoints < guild.rank2.points &&
    originalPoints + newPoints >= guild.rank2.points
  ) {
    const embed = new Discord.MessageEmbed()
      .setTitle(
        `NEW RANK ACHIEVED! You're now a ${guild.emoji} ${guild.emoji} **${guild.rank2.name}!** ${guild.emoji} ${guild.emoji}`,
      )
      .setDescription(
        `__With the ${guild.rank2.name} rank, you can now build **Medium Builds!**__\n\nExamples: Department stores, strip malls, parking garages, marinas, schools, mid-rise apartments, small airports/harbors, etc!`,
      )
    const dm = await member.createDM()

    dm.send({ embeds: [embed] }).catch((err) => {
      return `${member} has dms turned off or something went wrong while sending the dm! ${err}`
    })

    await member.roles.add(guild.rank2.id)
    return i.followUp(`user ranked up to **${guild.rank2.name}!**`)
  } else if (
    originalPoints < guild.rank3.points &&
    originalPoints + newPoints >= guild.rank3.points
  ) {
    const embed = new Discord.MessageEmbed()
      .setTitle(
        `NEW RANK ACHIEVED! You're now a ${guild.emoji} ${guild.emoji} **${guild.rank3.name}!** ${guild.emoji} ${guild.emoji}`,
      )
      .setDescription(
        `__With the **${guild.rank3.name}** rank, you can now build **Large Builds!**__\n\nExamples: Skyscrapers, high-rises, convention centers, universities, large airports/harbours, etc!`,
      )
    const dm = await member.createDM()

    dm.send({ embeds: [embed] }).catch((err) => {
      return `${member} has dms turned off or something went wrong while sending the dm! ${err}`
    })

    await member.roles.add(guild.rank3.id)

    return i.followUp(`user ranked up to **${guild.rank3.name}!**`)
  } else if (
    originalPoints < guild.rank4.points &&
    originalPoints + newPoints >= guild.rank4.points
  ) {
    const embed = new Discord.MessageEmbed()
      .setTitle(
        `NEW RANK ACHIEVED! You're now a ${guild.emoji} ${guild.emoji} **${guild.rank4.name}!** ${guild.emoji} ${guild.emoji}`,
      )
      .setDescription(
        `__With the **${guild.rank4.name}** rank, you can now build **Monumental Builds!**__\n\nExamples: Stadiums, amusement parks, megamalls, large medical or educational complexes, etc!`,
      )
    const dm = await member.createDM()

    dm.send({ embeds: [embed] }).catch((err) => {
      return `${member} has dms turned off or something went wrong while sending the dm! ${err}`
    })

    await member.roles.add(guild.rank4.id)

    return i.followUp(`user ranked up to **${guild.rank4.name}!**`)
  }
}
// subcommand options
const globalArgs = [
  {
    name: 'submissionid',
    description: 'Submission msg link',
    required: true,
    optionType: 'string',
  },
  {
    name: 'collaborators',
    description: 'Number of collaborators',
    required: false,
    optionType: 'integer',
  },
  {
    name: 'bonus',
    description: 'Event and landmark bonuses',
    choices: [
      ['event', 2],
      ['landmark', 2],
      ['landmark & event', 4],
    ],
    required: false,
    optionType: 'integer',
  },
  {
    name: 'edit',
    description: 'Is this review an edit',
    choices: [
      ['edit', true],
      ['not edit', false],
    ],
    required: false,
    optionType: 'boolean',
  },
]

const oneArgs = [
  {
    name: 'size',
    description: 'Building size',
    required: true,
    choices: [
      ['small', 2],
      ['medium', 5],
      ['large', 10],
      ['monumental', 20],
    ],
    optionType: 'integer',
  },
  {
    name: 'quality',
    description: 'Quality',
    required: true,
    choices: [
      ['bleh', 1],
      ['decent', 1.5],
      ['very nice', 2],
    ],
    optionType: 'number',
  },
]

const manyArgs = [
  {
    name: 'smallamt',
    description: 'Number of small buildings',
    required: true,
    optionType: 'integer',
  },
  {
    name: 'mediumamt',
    description: 'Number of medium buildings',
    required: true,
    optionType: 'integer',
  },
  {
    name: 'largeamt',
    description: 'Number of large buildings',
    required: true,
    optionType: 'integer',
  },
  {
    name: 'avgquality',
    description: 'Avg build quality from 1-2',
    required: true,
    optionType: 'number',
  },
]

const landArgs = [
  {
    name: 'sqm',
    description: 'Land size in square meters',
    required: true,
    optionType: 'number',
  },
  {
    name: 'complexity',
    description: 'Complexity of land',
    required: true,
    choices: [
      ['not complex lol', 1],
      ['kinda complex', 1.5],
      ['VERY COMPLEX', 2],
    ],
    optionType: 'number',
  },
]

const roadArgs = [
  {
    name: 'roadtype',
    description: 'Type of road',
    required: true,
    choices: [
      ['Standard', 2],
      ['Advanced', 5],
    ],
    optionType: 'number',
  },
  {
    name: 'distance',
    description:
      'Road distance (kilometers [sorry @ stupid imperial system americans])',
    required: true,
    optionType: 'number',
  },
  {
    name: 'complexity',
    description: 'Complexity of road',
    required: true,
    choices: [
      ['flat road', 1],
      ['bit complex', 1.5],
      ['COMPLEX', 2],
    ],
    optionType: 'number',
  },
]
