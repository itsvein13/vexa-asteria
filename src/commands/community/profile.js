import { SlashCommandBuilder } from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your profile."),

    async execute(interaction) {

        await interaction.reply({
            content: "🚧 Profile system is under construction."
        });

    }

};