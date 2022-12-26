import Command from '../base/Command.js';
import User from '../base/User.js';
class Preferences extends Command {
    constructor(client) {
        super(client, {
            name: 'preferences',
            description: 'Set user preferences.',
            subCommands: [
                {
                    name: 'dm',
                    description: 'Enable/disable build review DMs.',
                    args: [
                        {
                            name: 'enabled',
                            description: 'Enable/disable build review DMs.',
                            required: true,
                            optionType: 'boolean',
                        },
                    ],
                },
            ],
        });
    }
    async run(i) {
        if (i.options.getSubcommand() == 'dm') {
            const toggle = i.options.getBoolean('enabled');
            const userId = i.user.id;
            const userData = await this.client.getOrAddUser(userId);
            if (!userData)
                return i.reply('You have not submitted any builds yet; why are you using this command?');
            if (userData.dm == toggle) {
                if (toggle == true) {
                    return i.reply('You already have build review DMs enabled!');
                }
                else {
                    return i.reply('You already have build review DMs disabled!');
                }
            }
            await User.updateMany({ id: userId }, { dm: toggle }).lean();
            this.client.userCache.set(userId, { dm: toggle });
            if (toggle == true) {
                return i.reply('Build review DMs enabled :thumbsup:');
            }
            else {
                return i.reply('Build review DMs disabled :thumbsup:');
            }
        }
    }
}
export { Preferences };
