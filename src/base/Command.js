const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} = require('@discordjs/builders')

class Command {
  constructor(client, options) {
    this.client = client
    this.name = options.name
    this.description = options.description
    this.args = options.args
    this.permission = options.permission
    this.subCommands = options.subCommands
    this.cooldown = options.cooldown || 500
  }

  getData() {
    const Builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
    if (this.args) {
      addOptions(this.args, Builder)
    }

    if (this.subCommands) {
      this.subCommands.forEach((subCmd) => {
        const SubCommandBuilder = new SlashCommandSubcommandBuilder()
        SubCommandBuilder.setName(subCmd.name).setDescription(
          subCmd.description,
        )
        if (subCmd.args) {
          addOptions(subCmd.args, SubCommandBuilder)
        }
        Builder.addSubcommand(SubCommandBuilder)
      })
    }

    function addOptions(options, builder) {
      options.forEach((opt) => {
        if (!opt.choices) {
          opt.choices = []
        }
        if (opt.optionType == 'string') {
          builder.addStringOption((option) =>
            option
              .setName(opt.name)
              .setDescription(opt.description)
              .setChoices(opt.choices)
              .setRequired(opt.required),
          )
        } else if (opt.optionType == 'number') {
          builder.addNumberOption((option) =>
            option
              .setName(opt.name)
              .setDescription(opt.description)
              .setChoices(opt.choices)
              .setRequired(opt.required),
          )
        } else if (opt.optionType == 'integer') {
          builder.addIntegerOption((option) =>
            option
              .setName(opt.name)
              .setDescription(opt.description)
              .setChoices(opt.choices)
              .setRequired(opt.required),
          )
        } else if (opt.optionType == 'user') {
          builder.addUserOption((option) =>
            option
              .setName(opt.name)
              .setDescription(opt.description)
              .setChoices(opt.choices)
              .setRequired(opt.required),
          )
        } else if (opt.optionType == 'boolean') {
          builder.addBooleanOption((option) =>
            option
              .setName(opt.name)
              .setDescription(opt.description)
              .setRequired(opt.required),
          )
        }
      })
    }
    return Builder
  }
}

module.exports = Command
