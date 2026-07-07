import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("verify-setup")
        .setDescription("Send the verification panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("👋 Welcome to Synd1cate")
            .setDescription([
                "Welcome aboard! 💜",
                "",
                "You're just one step away from joining the community.",
                "",
                "Click **🚀 Join Synd1cate** below to unlock the **Wanderer** role and get access to every chat, voice channel, events, and exclusive community features.",
                "",
                "**See you around, Wanderer. 🚀**"
            ].join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/1309675924417024100/1475437037401407518/SYND1CATE.png?ex=6a4d7b92&is=6a4c2a12&hm=d3abb3182f80d9ea11455d1002871199f593d2f247f4472c381adb95dc9c9d16&")
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

    }

}