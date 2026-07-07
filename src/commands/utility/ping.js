import { SlashCommandBuilder } from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check Vexa's latency."),

    async execute(interaction) {

        await interaction.reply({
            content: `🏓 Pong! ${interaction.client.ws.ping}ms`
        });

    }

};