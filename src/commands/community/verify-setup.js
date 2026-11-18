import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";

import { recordSetupRun } from "../../database/setupLog.js";

export default {

    data: new SlashCommandBuilder()
        .setName("verify-setup")
        .setDescription("Send the verification panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#F1EEE6")
            .setTitle("👋 Welcome to Synd1cate")
            .setDescription([
                "Welcome to **Synd1cate.**",
                "",
                "Verify below to gain access to the archive and become part of the collective.",
                "",
                "✦ Full archive access",
                "✦ Community spaces",
                "✦ Gaming & projects",
                "✦ Events & gatherings",
                "",
                "_Your presence is now part of the archive._"
            ].join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1543936792292757605/Verify.png?ex=6a96aeb0&is=6a955d30&hm=f09aa9fc7541e3a36ad094be189e9876c079526bf85f9b97aa5679eed6860d7c&")
            .setFooter({
                text: "Powered by Vexa"
            });

        const button = new ButtonBuilder()
            .setCustomId("verify")
            .setLabel("🚀 Join Synd1cate")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

        recordSetupRun(interaction.guild.id, "verify-setup");

    }

}