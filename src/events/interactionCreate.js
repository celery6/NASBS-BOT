async function execute(client, interaction) {
  if (!interaction.isCommand()) return console.log('nocomand')
  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.run(interaction)
  } catch (err) {
    console.log(err)
  }
}

module.exports = execute
