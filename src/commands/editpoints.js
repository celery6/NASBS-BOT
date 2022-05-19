const Command = require('../base/Command')
const User = require('../base/User')
const Discord = require('discord.js')

class EditPoints extends Command {
     constructor(client) {
       super(client, {
         name: 'editpoints',
         description: 'Manually edits a users points (Requires Admin permissions on discord server).',
         args: [
           {
             name: 'operation',
             description: `Choose an operation to alter the points`,
             choices: [
              ['add'],
              ['subtract'],
            ],
             required: true,
             optionType: 'string',
           },
           {
             name: 'user',
             description: `The user whos points will be altered`,
             required: true,
             optionType: 'user',
           },
           {
             name: 'amount',
             description: `The amount the users points will be altered by`,
             required: true,
             optionType: 'number',
          },
         ],
       })
     }

     async run(i) {
          const guild = this.client.guildsData.get(i.guild.id)
          const user = options.getUser('user') || false
          let userId = user.id
          let amount = options.getNumber("amount")
          let pointsTotal
          let guildName
          let userData  
          let increment
          let decrement
                
          guildName = guild.name
          userData = await User.findOne({ id: userId, guildId: guild.id }).lean()

      // return if user is not in db
      if (!userData) {
          return i.reply({
             embeds: [
               new Discord.MessageEmbed().setDescription(
                `<@${userId}> has not gained any points yet :frowning2: <:sad_cat:873457028981481473>`,
               ),
             ],
          })
        }

      //amount can never be negative 
      if (amount < 0) {
        amount = amount * -1
      }
      
      if (options.getString('operation') == 'add' && message.member.roles.find(role => role.hasPermission('Administrator'))) {
        //increments users team points by provided integer or double
        increment = pointsTotal + amount;
        await userData.updateOne(
            { $inc: { pointsTotal: increment } },
            { upsert: true },
          ).lean()
      }
         

      else if (options.getString('operation') == 'subtract' && message.member.roles.find(role => role.hasPermission('Administrator'))) {
        decrement = pointsTotal - amount;
        //Negative case
        if (decrement < 0) {
          return i.reply({
            embeds: [
              new Discord.MessageEmbed().setDescription(
               `Cannot edit a users score to be a negative value`,
              ),
            ],
         })
        }
  
        else {
          //decrements users team points by provided integer or double
          await userData.updateOne(
              { $dec: { pointsTotal: decrement } },
              { upsert: true },
            ).lean()
      }
    }
    //Author of command must have admin perms on team
    else {
      return i.reply({
        embeds: [
          new Discord.MessageEmbed().setDescription(
            `Only users with administrative permissions are able to manually alter a users score`,
          ),
        ],
      })
    }
  }
}

module.exports = EditPoints
