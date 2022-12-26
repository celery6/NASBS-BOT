import { SlashCommandBuilder, SlashCommandSubcommandBuilder, } from '@discordjs/builders';
class Command {
    client;
    name;
    description;
    reviewer;
    args;
    subCommands;
    cooldown;
    constructor(client, properties) {
        this.client = client;
        this.name = properties.name;
        this.description = properties.description;
        this.reviewer = properties.reviewer;
        this.args = properties.args;
        this.subCommands = properties.subCommands;
        this.cooldown = properties.cooldown || 500;
    }
    getData() {
        const Builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        if (this.args) {
            addOptions(this.args, Builder);
        }
        if (this.subCommands) {
            this.subCommands.forEach((subCmd) => {
                const SubCommandBuilder = new SlashCommandSubcommandBuilder();
                SubCommandBuilder.setName(subCmd.name).setDescription(subCmd.description);
                if (subCmd.args) {
                    addOptions(subCmd.args, SubCommandBuilder);
                }
                Builder.addSubcommand(SubCommandBuilder);
            });
        }
        function addOptions(options, builder) {
            options.forEach((opt) => {
                if (!opt.choices) {
                    opt.choices = [];
                }
                if (opt.optionType == 'string') {
                    builder.addStringOption((option) => option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setChoices(opt.choices)
                        .setRequired(opt.required));
                }
                else if (opt.optionType == 'number') {
                    builder.addNumberOption((option) => option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setChoices(opt.choices)
                        .setRequired(opt.required));
                }
                else if (opt.optionType == 'integer') {
                    builder.addIntegerOption((option) => option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setChoices(opt.choices)
                        .setRequired(opt.required));
                }
                else if (opt.optionType == 'user') {
                    builder.addUserOption((option) => option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setRequired(opt.required));
                }
                else if (opt.optionType == 'boolean') {
                    builder.addBooleanOption((option) => option
                        .setName(opt.name)
                        .setDescription(opt.description)
                        .setRequired(opt.required));
                }
            });
        }
        return Builder;
    }
}
export default Command;
