const Command = require('../base/Command')
const User = require('../base/User')
const Submission = require('../base/Submission')
const Discord = require('discord.js')

class Pogress extends Command {
  constructor(client) {
    super(client, {
      name: 'pogress',
      description: 'View your rankup progress.',
      args: [
        {
          name: 'user',
          description: `View someone else's rankup progress`,
          required: false,
          optionType: 'user',
        },
      ],
    })
  }

  async run(i) {
    const guildData = this.client.guildsData.get(i.guild.id)
    const guildId = i.guild.id
    const options = i.options
    const member = options.getMember('user') || i.member
    const userId = member.id
    const guildName = guildData.name
    const userData = await User.findOne({
      id: userId,
      guildId: guildData.id,
    }).lean()

    // RETURN if user does not exist in db
    if (!userData) {
      i.reply({
        embeds: [
          new Discord.MessageEmbed().setDescription(
            `<@${userId}> has not gained any points yet :frowning2: <:sad_cat:873457028981481473>`,
          ),
        ],
      })
    }

    // get user's next possible rank and display progress towards it (TODO: display an actual visual emoji (?) progress bar)
    if (member.roles.cache.get(guildData.rank4.id)) {
      // check progress towards CHAMPION
      // get points for excellent quality all sizes
      const level5 = await Submission.aggregate([
        {
          $match: {
            userId: userId,
            guildId: guildId,
            quality: 2,
          },
        },
        {
          $group: {
            _id: '$userId',
            points: {
              $sum: {
                $cond: [
                  // if submission type is ONE and the size is 1 or greater (all sizes), add its points to the sum
                  { $eq: ['$submissionType', 'ONE'] },
                  { $cond: [{ $gte: ['$size', 1] }, '$pointsTotal', 0] },
                  // else the submission type must be MANY, so calculate # of points from all sizes and add it to the sum
                  {
                    $multiply: [
                      {
                        $multiply: [
                          {
                            $sum: [
                              { $multiply: ['$smallAmt', 2] },
                              { $multiply: ['$mediumAmt', 5] },
                              { $multiply: ['$largeAmt', 10] },
                            ],
                          },
                          '$quality',
                        ],
                      },
                      '$complexity',
                    ],
                  },
                ],
              },
            },
          },
        },
      ])

      await i.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(
              `Progress of <@${userId}> in ${guildData.emoji} ${guildName} ${guildData.emoji} WOOHOOO!`,
            )
            .setDescription(
              `**Current rank:** ${
                guildData.rank4.name
              }!\n\n**Progress towards ${
                guildData.rank5.name
              }:** <a:loadinggg:996842291593486346>\n${
                userData.pointsTotal
              }**/${guildData.rank5.points}** points\n${
                level5[0].points
              }**/${400}** points from Excellent quality builds of any size`,
            ),
        ],
      })
    } else if (member.roles.cache.get(guildData.rank3.id)) {
      // check progress towards ARCHITECT
      // get points for good/excellent quality medium or above
      const largeOrMediums = await Submission.aggregate([
        {
          $match: {
            userId: userId,
            guildId: guildId,
            quality: { $gte: 1.5 },
          },
        },
        {
          $group: {
            _id: '$userId',
            points: {
              $sum: {
                $cond: [
                  // if submission type is ONE and the size is 5 or greater (medium), add the submission's pointstotal to the sum
                  { $eq: ['$submissionType', 'ONE'] },
                  { $cond: [{ $gte: ['$size', 5] }, '$pointsTotal', 0] },
                  // else the submission type must be MANY, so calculate # of points from mediums and add it to the sum
                  {
                    $multiply: [
                      {
                        $multiply: [
                          {
                            $sum: [
                              { $multiply: ['$mediumAmt', 5] },
                              { $multiply: ['$largeAmt', 10] },
                            ],
                          },
                          '$quality',
                        ],
                      },
                      '$complexity',
                    ],
                  },
                ],
              },
            },
          },
        },
      ])

      await i.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(
              `Progress of <@${userId}> in ${guildData.emoji} ${guildName} ${guildData.emoji} WOOHOOO!`,
            )
            .setDescription(
              `**Current rank:** ${
                guildData.rank3.name
              }\n\n**Progress towards ${
                guildData.rank4.name
              }:** <a:loadinggg:996842291593486346>\n${
                userData.pointsTotal
              }**/${guildData.rank4.points}** points\n${
                largeOrMediums[0].points
              }**/${200}** points from Good/Excellent quality Medium/Large builds`,
            ),
        ],
      })
    } else if (member.roles.cache.get(guildData.rank2.id)) {
      // check progress towards MASTER BUILDER
      // get points for good/excellent quality medium or above

      const largeOrMediums = await Submission.aggregate([
        {
          $match: {
            userId: userId,
            guildId: guildId,
            quality: { $gte: 1.5 },
          },
        },
        {
          $group: {
            _id: '$userId',
            points: {
              $sum: {
                $cond: [
                  // if submission type is ONE and the size is 5 or greater (medium), add the submission's pointstotal to the sum
                  { $eq: ['$submissionType', 'ONE'] },
                  { $cond: [{ $gte: ['$size', 5] }, '$pointsTotal', 0] },
                  // else the submission type must be MANY, so calculate # of points from mediums and add it to the sum
                  {
                    $multiply: [
                      {
                        $multiply: [
                          {
                            $sum: [
                              { $multiply: ['$mediumAmt', 5] },
                              { $multiply: ['$largeAmt', 10] },
                            ],
                          },
                          '$quality',
                        ],
                      },
                      '$complexity',
                    ],
                  },
                ],
              },
            },
          },
        },
      ])

      await i.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(
              `Progress of <@${userId}> in ${guildData.emoji} ${guildName} ${guildData.emoji} WOOHOOO!`,
            )
            .setDescription(
              `**Current rank:** ${
                guildData.rank2.name
              }\n\n**Progress towards ${guildData.rank3.name}:**\n${
                userData.pointsTotal
              }**/${guildData.rank3.points}** points\n${
                largeOrMediums[0].points
              }**/${100}** points from Good/Excellent quality Medium builds`,
            ),
        ],
      })
    } else if (member.roles.cache.get(guildData.rank1.id)) {
      // check progress towards SENIOR BUILDER
      await i.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setTitle(`Progress of <@${userId}> in ${guildName} WOOHOOO!`)
            .setDescription(
              `**Current rank:** ${guildData.rank1.name}\n\n**Progress towards ${guildData.rank2.name}:** <a:loadinggg:996842291593486346>\n${userData.pointsTotal}/${guildData.rank2.points} points`,
            ),
        ],
      })
    }
  }
}

module.exports = Pogress
