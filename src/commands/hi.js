const Command = require('../base/Command')

class Hi extends Command {
  constructor(client) {
    super(client, {
      name: 'hi',
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
    })
  }

  async run(i) {
    i.reply('hi')
  }
}

module.exports = Hi
