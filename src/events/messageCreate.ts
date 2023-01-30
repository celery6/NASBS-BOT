import Discord from 'discord.js'

export default async function execute(client, msg) {
    if (msg.author.bot) return
    if (client.test || (!client.test && msg.guild.id == '935926834019844097')) return

    const guild = client.guildsData.get(msg.guild.id)
    if (!guild) return

    // check for correct formatting for all messages in build-submit channel
    if (msg.channel.id == guild.submitChannel) {
        // check for images
        if (msg.attachments.size === 0) {
            return reject(client, msg, guild, 'NO IMAGE FOUND')
        }

        // ensure there are at least 2 lines (# and coords)
        const lines = msg.content.split('\n')
        if (lines.length < 2) {
            return reject(client, msg, guild, '')
        }

        const coordsRegex =
            /^(\s*[(]?[-+]?([1-8]+\d\.(\d+)?|90(\.0+))\xb0?,?\s+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]+\d))\.(\d+))\xb0?\s*)|(\s*(\d{1,3})\s*(?:°|d|º| |g|o)\s*([0-6]?\d)\s*(?:'|m| |´|’|′))/

        let coords = false
        let count = false

        // check content of each line for either count (including range x-z) or coords
        lines.forEach((line) => {
            line = line.replace(/#/g, '')
            if (coordsRegex.test(line) === true) {
                coords = true
            } else if (!isNaN(line) && Number.isInteger(Number(line))) {
                count = true
            } else if (
                line.includes('-') &&
                line.split('-').length === 2 &&
                !isNaN(line.replace('-', ''))
            ) {
                count = true
            }
        })

        // reject submission if it doesn't include coords or a count
        if (!coords) {
            reject(client, msg, guild, 'INVALID OR UNRECOGNIZED COORDINATES')
        } else if (!count) {
            reject(client, msg, guild, 'BUILD COUNT NOT PRESENT')
        }
    }
}

async function reject(client, msg, guild, reason) {
    const embed = new Discord.MessageEmbed()
        .setTitle(`INCORRECT SUBMISSION FORMAT: ${reason}`)
        .setDescription(
            `**[Correct format:](${guild.formattingMsg})**\n[Build count]\n[Coordinates]\n[Location name] (OPTIONAL)\n[Image(s) of build]\n\n__The entire submission must be in ONE MESSAGE!__\nView [pinned message](${guild.formattingMsg}) for more details.`
        )

    const rejectionMsg = await msg.channel.send({ embeds: [embed] })

    setTimeout(() => {
        rejectionMsg.delete()
        msg.delete()
    }, 30000)
}

export { execute }
