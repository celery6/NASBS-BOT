const Command = require('../base/Command')
const User = require('../base/User')
const Discord = require('discord.js')
const Submission = require('../base/Submission')

class Points extends Command {
  constructor(client) {
    super(client, {
      name: 'points',
      description: 'View your points.',
      args: [
        {
          name: 'user',
          description: `View someone else's points`,
          required: false,
          optionType: 'user',
        },
        {
          name: 'global',
          description: `View global NASBS points from all teams`,
          required: false,
          optionType: 'boolean',
        },
        {
          name: 'advanced',
          description: `View a breakdown of your point total`,
          required: false,
          optionType: 'boolean',
        },
      ],
    })
  }

  async run(i) {
    const guild = this.client.guildsData.get(i.guild.id)
    const options = i.options
    const user = options.getUser('user') || i.user
    const global = options.getBoolean('global')
    const advanced = options.getBoolean('advanced')
    const userId = user.id
    let guildName
    let userData
    let usersAbove
    let buildData

    if (global) {
      // sum user's stats from all guilds
      guildName = 'all build teams'
      userData = await User.aggregate([
        { $match: { id: userId } },
        {
          $group: {
            _id: '$id',
            pointsTotal: { $sum: '$pointsTotal' },
            buildingCount: { $sum: '$buildingCount' },
            roadKMs: { $sum: '$roadKMs' },
            sqm: { $sum: '$sqm' },
          },
        },
      ])
      userData = userData[0]

      // return if user does not exist in db
      if (!userData) {
        return i.reply({
          embeds: [
            new Discord.MessageEmbed().setDescription(
              `<@${userId}> has not gained any points yet :frowning2: <:sad_cat:873457028981481473>`,
            ),
          ],
        })
      }

      // return if advanced stats and global are both checked. 
      if (advanced) {
        return i.reply({
          embeds: [
            new Discord.MessageEmbed().setDescription(
              `Advanced stats are not avaliable globably.`
            ),
          ],
        })
      }

      // get global leaderboard position by getting global points of all users, then counting how many users have more global points
      usersAbove = await User.aggregate([
        {
          $group: {
            _id: '$id',
            pointsTotal: { $sum: '$pointsTotal' },
          },
        },
        {
          $match: { pointsTotal: { $gt: userData.pointsTotal } },
        },
        { $count: 'count' },
      ])
    } else {
      guildName = guild.name
      userData = await User.findOne({ id: userId, guildId: guild.id }).lean()

      // return if user does not exist in db
      if (!userData) {
        return i.reply({
          embeds: [
            new Discord.MessageEmbed().setDescription(
              `<@${userId}> has not gained any points yet :frowning2: <:sad_cat:873457028981481473>`,
            ),
          ],
        })
      }

      // return advanced stats to user for points to next rankup
      if (advanced) {
        if (member.roles.cache.has(guild.rank5.id)){
          return i.reply({
            embeds: [
              new Discord.MessageEmbed().setDescription(
                `<@${userId}> There are no more ranks to acheive`
              ),
            ],
          })
        } else if(member.roles.cache.has(guild.rank4.id)){
          buildData = await Submission.aggregate([
            { $match: { id: userId, guildId: guild.id, quality: { $gte: 2 }}},
            {
              $group: {
                 _id: 'userId',
                 pointsTotal: {
                   $sum: {
                     $cond: [
                       { $eq: ['$submissionType', 'ONE']},
                       '$pointsTotal',
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
                     ],
                   },
                 },
              },
            },
          ])
        } else if(member.roles.cache.has(guild.rank3.id)){
          buildData = await Submission.aggregate([
            { $match: { id: userId, guildId: guild.id, quality: { $gte: 1.5 }}},
            {
              $group: {
                _id: '$userId',
                pointsTotal: {
                  $sum: {
                    $cond: [
                      { $eq: ['$submissionType', 'ONE'] },
                      { $cond: [{ $gte: ['$size', 5] }, '$pointsTotal', 0] },
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
                    ],
                  },
                },
              },
            },
          ])
        } else if (member.roles.cache.has(guild.rank2.id)){
          buildData = await Submission.aggregate([
            
          ])
        }
      }

      // get guild leaderboard position by getting points of all users in guild, then counting how many users have more points
      usersAbove = await User.aggregate([
        {
          $match: { guildId: guild.id },
        },
        {
          $group: {
            _id: '$id',
            pointsTotal: { $sum: '$pointsTotal' },
          },
        },
        {
          $match: { pointsTotal: { $gt: userData.pointsTotal } },
        },
        { $count: 'count' },
      ])
    }

    if (usersAbove.length == 0) {
      usersAbove = 0
    } else {
      usersAbove = usersAbove[0].count
    }

    await i.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle(`POINTS!`)
          .setDescription(
            `${user} has :tada: ***${
              userData.pointsTotal
            }***  :tada: points in ${guildName}!!\n\nNumber of buildings: :house: ***${
              userData.buildingCount || 0
            }***  :house: !!!\nSqm of land: :corn: ***${
              userData.sqm || 0
            }***  :corn:\nKilometers of roads: :motorway: ***${
              userData.roadKMs || 0
            }***  :motorway:\n\nLeaderboard position in ${guildName}: **#${
              usersAbove + 1
            }**`,
          ),
      ],
    })
  }
}

module.exports = Points
