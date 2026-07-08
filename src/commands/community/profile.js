import { SlashCommandBuilder } from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your profile."),

    async execute(interaction) {

        console.log("PROFILE START");

        await interaction.reply({
            content: "Profile works!"
        });

        console.log("PROFILE END");

    }

};