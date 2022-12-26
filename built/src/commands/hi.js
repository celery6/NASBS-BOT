import Command from '../struct/Command.js';
class Hi extends Command {
    constructor(client) {
        super(client, {
            name: 'hi',
            reviewer: false,
            description: 'hi command.',
            args: [
                {
                    name: 'option',
                    description: 'this is an option!',
                    required: false,
                    optionType: 'string',
                },
                {
                    name: 'numberoption',
                    description: 'also an option',
                    required: false,
                    optionType: 'number',
                },
            ],
            async run(i) {
                i.reply('hi im a furry');
            },
        });
    }
}
export { Hi };
