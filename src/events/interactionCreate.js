export default {
    name: "interactionCreate",

    async execute(interaction, client) {

        // Slash Commands
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            return command.execute(interaction);
        }

        // Buttons
        if (interaction.isButton()) {

            const button = client.buttons.get(interaction.customId);

            if (!button) return;

            return button.execute(interaction);
        }
        if (interaction.isStringSelectMenu()) {

    const menu = client.selectMenus.get(interaction.customId);

    if (!menu) return;

    return menu.execute(interaction);

}
    }
};