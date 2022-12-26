const Client = require('../base/Client.js');
const { Collection, MessageReaction, Message, Snowflake, } = require('discord.js');
const Submission = require('../base/Submission.js');
/**
 * When the bot's ✅ reaction is removed from a submission, add the reaction back if the submission is still in the database
 * @param {Client} client
 * @param {Message} submissionMsg
 * @param {Collection<(string|Snowflake), MessageReaction>} reactions
 * @returns
 */
async function execute(client, submissionMsg, reactions) {
    const guild = submissionMsg.guild;
    if (!guild) {
        return;
    }
    if ((!client.test && guild.id == '935926834019844097') ||
        (client.test && guild.id != '935926834019844097'))
        return;
    const guildData = client.guildsData.get(guild.id);
    if (!guildData) {
        return;
    }
    if (reactions.some((reaction) => reaction.emoji.name === '✅')) {
        const submission = await Submission.findOne({
            _id: submissionMsg.id,
        }).lean();
        if (submission) {
            console.log(`✅ reaction was removed from ${submissionMsg.url}. Adding it back because the submission is still in the database`);
            await submissionMsg.react('✅');
        }
    }
}
module.exports = execute;
