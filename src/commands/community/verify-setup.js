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
                "Glad to have you here! 💜",
                "",
                "Hit the button below to unlock the server and start hanging out with the community.",
                "",
                "✨ Full server access",
                "💬 Community chats",
                "🎮 Gaming channels",
                "🎉 Events & more",
                "",
                "**See you around, Wanderer! 🚀**"
            ].join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1524290616010346496/VERIFY_HERE.png?ex=6a4f35c2&is=6a4de442&hm=4cc85374c5ea0df48ad96170b39d51d3621dcdd5645fb2732257d1eb25a3d225&")
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