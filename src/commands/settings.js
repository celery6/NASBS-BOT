const Command = require('../base/Command')
const Guild = require('../base/Guild')

class Settings extends Command {
  constructor(client) {
    super(client, {
      name: 'settings',
      description: 'Configure server settings.',
      args: [
        {
          name: 'buildsubmit',
          description: 'Build submit channel ID',
          required: true,
          optionType: 'string',
        },
        {
          name: 'reviewersrole',
          description: 'Reviewer role ID',
          required: true,
          optionType: 'string',
        },
        {
          name: 'rank1',
          description: 'Level 1 rank role ID',
          required: true,
          optionType: 'string',
        },
        {
          name: 'rank2',
          description: 'Level 2 rank role ID',
          required: true,
          optionType: 'string',
        },
        {
          name: 'rank3',
          description: 'Level 3 rank role ID',
          required: true,
          optionType: 'string',
        },
        {
          name: 'rank4',
          description: 'Level 4 rank role ID',
          required: true,
          optionType: 'string',
        },
      ],
    })
  }

  async run(i) {
    const client = this.client

    await i.reply('Configuring server settings...')

    const options = i.options
    const guildId = i.guild.id
    const settings = {
      id: guildId,
      submitChannel: options.getString('buildsubmit'),
      reviewerRole: options.getString('reviewersrole'),
      ranks: {
        level1: options.getString('rank1'),
        level2: options.getString('rank2'),
        level3: options.getString('rank3'),
        level4: options.getString('rank4'),
      },
    }

    Guild.find({ id: guildId }, async function (err, guild) {
      if (err) return i.followUp(err)
      if (guild) {
        await Guild.updateOne({ id: guildId }, settings)
        i.followUp('Server settings successfully updated!')
      } else {
        const guild = new Guild(settings)
        await guild.save()
        i.followUp('New server settings successfully created!')
      }
      client.guildsData.set(guildId, settings)
      console.log(client.guildsData)
    })
  }
}

module.exports = Settings
