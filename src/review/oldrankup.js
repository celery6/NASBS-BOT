const Discord = require('discord.js')

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

module.exports = rankup
