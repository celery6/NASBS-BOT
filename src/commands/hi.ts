import Command from '../struct/Command.js'

export default new Command({
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
  async run(i, client) {
    i.reply('hi im a furry')
  },
})
