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
            .setTitle("🎭 Choose Your Roles")
            .setDescription([
                "Make **Synd1cate** feel like home.",
                "",
                "Pick the games you play, choose your vibe, and let everyone know if you're a content creator.",
                "",
                "You can update your roles anytime from this panel."
            ].join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1524289546840440852/CHOOSE_ROLES.png?ex=6a4f34c3&is=6a4de343&hm=6c845d8106e622c7fc8c82edc6eaa9bea47cff72dee18b6c2950b056de56d68f&")
            .setFooter({
                text: "Powered by Vexa"
            });

        const games = new StringSelectMenuBuilder()
            .setCustomId("games-role-menu")
            .setPlaceholder("🎮 Select your games")
            .setMinValues(0)
            .setMaxValues(10)
            .addOptions(
                {
                    label: "Need For Speed",
                    value: "nfs",
                    emoji: "🏎",
                    description: "Street racing never gets old."
                },
                {
                    label: "Racing Master",
                    value: "racing_master",
                    emoji: "🏁",
                    description: "Master every corner."
                },
                {
                    label: "GTA V",
                    value: "gta",
                    emoji: "🚗",
                    description: "Chaos, roleplay, and heists."
                },
                {
                    label: "Delta Force",
                    value: "delta",
                    emoji: "🪖",
                    description: "Tactical military action."
                },
                {
                    label: "Valorant",
                    value: "valorant",
                    emoji: "💥",
                    description: "Precision meets teamwork."
                },
                {
                    label: "PUBG",
                    value: "pubg",
                    emoji: "🔫",
                    description: "Fight to be the last one standing."
                },
                {
                    label: "Mobile Legends",
                    value: "ml",
                    emoji: "⚔️",
                    description: "Classic MOBA battles."
                },
                {
                    label: "Roblox",
                    value: "roblox",
                    emoji: "🟩",
                    description: "Play anything you can imagine."
                },
                {
                    label: "Counter-Strike 2",
                    value: "cs2",
                    emoji: "💣",
                    description: "Competitive tactical shooter."
                },
                {
                    label: "Minecraft",
                    value: "minecraft",
                    emoji: "⛏",
                    description: "Build, survive, and explore."
                }
            );

        const vibes = new StringSelectMenuBuilder()
            .setCustomId("vibes-role-menu")
            .setPlaceholder("✨ Pick your vibe")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                {
                    label: "Chill",
                    value: "chill",
                    emoji: "🌿",
                    description: "Just vibing."
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
                    description: "Playing to win."
                },
                {
                    label: "Nocturnal",
                    value: "nocturnal",
                    emoji: "🌙",
                    description: "Online when everyone sleeps."
                },
                {
                    label: "Music Lover",
                    value: "music",
                    emoji: "🎵",
                    description: "Music on. World off."
                },
                {
                    label: "Movie Enjoyer",
                    value: "movie",
                    emoji: "🎬",
                    description: "Always watching something."
                },
                {
                    label: "Tech Enthusiast",
                    value: "tech",
                    emoji: "💻",
                    description: "Tech is my playground."
                }
            );

        const streamer = new StringSelectMenuBuilder()
            .setCustomId("streamer-role-menu")
            .setPlaceholder("📹 Content creator?")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                {
                    label: "Yes, I'm a Streamer",
                    value: "streamer",
                    emoji: "🔴",
                    description: "I stream or create content."
                },
                {
                    label: "Just Here to Hang Out",
                    value: "human",
                    emoji: "👤",
                    description: "I'm here for the community."
                }
            );

        const row1 = new ActionRowBuilder().addComponents(games);
        const row2 = new ActionRowBuilder().addComponents(vibes);
        const row3 = new ActionRowBuilder().addComponents(streamer);

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2, row3]
        });

    }

}