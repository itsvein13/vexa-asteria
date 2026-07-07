import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("roles-setup")
        .setDescription("Send the role menu panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("🎭 Customize Your Roles")
            .setDescription([
                "Make your profile yours! 💜",
                "",
                "Choose the games you play, your vibe, and whether you're a streamer.",
                "",
                "You can come back here anytime to update your roles."
            ].join("\n"))
            .setFooter({
                text: "Powered by Vexa"
            });

        const games = new StringSelectMenuBuilder()
            .setCustomId("games-role-menu")
            .setPlaceholder("🎮 Choose your games...")
            .setMinValues(0)
            .setMaxValues(9)
            .addOptions(
                {
                    label: "Need For Speed",
                    value: "nfs",
                    emoji: "🏎"
                },
                {
                    label: "Delta Force",
                    value: "delta",
                    emoji: "🪖"
                },
                {
                    label: "Valorant",
                    value: "valorant",
                    emoji: "💥"
                },
                {
                    label: "GTA V",
                    value: "gta",
                    emoji: "🚗"
                },
                {
                    label: "PUBG",
                    value: "pubg",
                    emoji: "🔫"
                },
                {
                    label: "Mobile Legends",
                    value: "ml",
                    emoji: "⚔️"
                },
                {
                    label: "Roblox",
                    value: "roblox",
                    emoji: "🟩"
                },
                {
                    label: "Counter Strike 2",
                    value: "cs2",
                    emoji: "💣"
                },
                {
                    label: "Minecraft",
                    value: "minecraft",
                    emoji: "⛏"
                }
            );

  const vibes = new StringSelectMenuBuilder()
    .setCustomId("vibes-role-menu")
    .setPlaceholder("✨ What's your vibe?")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
        {
            label: "Chill",
            value: "chill",
            emoji: "🌿",
            description: "Relaxed and easy-going."
        },
        {
            label: "Yapper",
            value: "yapper",
            emoji: "💬",
            description: "Always down to chat."
        },
        {
            label: "Competitive",
            value: "competitive",
            emoji: "🔥",
            description: "Always playing to win."
        },
        {
            label: "Nocturnal",
            value: "nocturnal",
            emoji: "🌙",
            description: "Most active at night."
        },
        {
            label: "Music Lover",
            value: "music",
            emoji: "🎵",
            description: "Music is life."
        },
        {
            label: "Movie Enjoyer",
            value: "movie",
            emoji: "🎬",
            description: "Movie nights every day."
        },
        {
            label: "Tech Enthusiast",
            value: "tech",
            emoji: "💻",
            description: "Loves technology."
        }
    );

const streamer = new StringSelectMenuBuilder()
    .setCustomId("streamer-role-menu")
    .setPlaceholder("🎥 Are you a streamer?")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
        {
            label: "Yes, I'm a Streamer",
            value: "streamer",
            emoji: "🔴",
            description: "I create content or livestream."
        },
        {
            label: "No, I'm just chilling",
            value: "human",
            emoji: "👤",
            description: "I'm here to enjoy the community."
        }
    );

const row1 = new ActionRowBuilder()
    .addComponents(games);

const row2 = new ActionRowBuilder()
    .addComponents(vibes);

const row3 = new ActionRowBuilder()
    .addComponents(streamer);

await interaction.reply({
    embeds: [embed],
    components: [row1, row2, row3]
});

    }

}