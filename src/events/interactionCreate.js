async function execute(client, interaction) {
  if (!interaction.isCommand()) return console.log('nocomand')
  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.run(interaction)
  } catch (err) {
    console.log(err)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: false,
    })
  }
}

module.exports = execute
