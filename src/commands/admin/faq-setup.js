import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

import { recordSetupRun } from "../../database/setupLog.js";

export default {

    data: new SlashCommandBuilder()
        .setName("faq-setup")
        .setDescription("Send the FAQ panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("❓ Frequently Asked Questions")
            .setDescription([
                "Got a question? Chances are you'll find the answer below.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "🔐 **How do I unlock the server?**",
                "> Verify yourself in **#✅・verify**.",
                "",
                "🎭 **How do I get game or community roles?**",
                "> Head over to **#🎭・role-menu** and customize your profile.",
                "",
                "🎮 **Can I choose multiple game roles?**",
                "> Absolutely! Pick every game you actively play.",
                "",
                "✨ **Can I change my roles later?**",
                "> Yep! You can update them anytime from the Role Menu.",
                "",
                "📷 **Where can I share screenshots or clips?**",
                "> Post them in **#📷・media**.",
                "",
                "📢 **Can I promote my content?**",
                "> Yes, but only in **#🔗・share-link**.",
                "",
                "🤖 **Who is Vexa?**",
                "> Vexa is Synd1cate's custom-built bot, designed to manage roles, community features, and future systems.",
                "",
                "🆘 **Need more help?**",
                "> Feel free to contact any Staff member."
            ].join("\n"))

            // ===== FAQ Banner =====
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1524289547280846878/FAQ.png?ex=6a4f34c4&is=6a4de344&hm=3c35ffd3ec8b2a4fd3e98ca088a6a67f68058bc44a048d17b12ce320ceee8675&")

            .setFooter({
                text: "Powered by Vexa"
            });

        await interaction.reply({
            embeds: [embed]
        });

        recordSetupRun(interaction.guild.id, "faq-setup");

    }

}