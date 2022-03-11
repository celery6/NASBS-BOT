const { SlashCommandBuilder } = require('@discordjs/builders')

class Command {
  constructor(client, options) {
    this.client = client
    this.name = options.name
    this.description = options.description
    this.args = options.args
    this.permission = options.permission
    this.cooldown = options.cooldown || 500
  }

  getData() {
    const Builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)

    this.args.forEach((arg) => {
      if (arg.optionType == 'string') {
        Builder.addStringOption((option) =>
          option
            .setName(arg.name)
            .setDescription(arg.description)
            .setRequired(arg.required),
        )
      }
    })
    return Builder
  }
}

module.exports = Command
