import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("faq-setup")
        .setDescription("Send the interactive FAQ panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("❓ Frequently Asked Questions")
            .setDescription([
                "Got a question? We've got you covered.",
                "",
                "Browse the categories below to quickly find answers about Synd1cate, roles, Vexa, and more.",
                "",
                "Still need help?",
                "Our Staff team is always happy to help."
            ].join("\n"))

            // FAQ Banner
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1524289547280846878/FAQ.png?ex=6a4f34c4&is=6a4de344&hm=3c35ffd3ec8b2a4fd3e98ca088a6a67f68058bc44a048d17b12ce320ceee8675&")

            .setFooter({
                text: "Powered by Vexa"
            });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("faq-menu")
            .setPlaceholder("📚 Select a FAQ category")
            .addOptions(
                {
                    label: "Getting Started",
                    value: "getting_started",
                    emoji: "🔐",
                    description: "Verification & server access."
                },
                {
                    label: "Roles",
                    value: "roles",
                    emoji: "🎭",
                    description: "Games, vibes & streamer."
                },
                {
                    label: "Community",
                    value: "community",
                    emoji: "💬",
                    description: "Channels & server info."
                },
                {
                    label: "About Vexa",
                    value: "vexa",
                    emoji: "🤖",
                    description: "Meet Synd1cate's assistant."
                },
                {
                    label: "Support",
                    value: "support",
                    emoji: "🆘",
                    description: "Need extra help?"
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(menu);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

}