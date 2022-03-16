async function execute(client, interaction) {
  if (!interaction.isCommand()) return

  if (!interaction.guild) {
    return interaction.reply('commands must be used in servers!')
  }

  const guildData = client.guildsData.get(interaction.guild.id)
  if (!guildData) return interaction.reply('this server is not registered :(')

  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    if (command.reviewer == true) {
      const member = await interaction.guild.members.fetch(interaction.user.id)
      if (!member.roles.cache.has(guildData.reviewerRole)) {
        return await interaction.reply(
          'you do not have permission to use this command <:bonk:720758421514878998>',
        )
      }
    }

    await command.run(interaction)
  } catch (err) {
    console.log(err)
  }
}

module.exports = execute
