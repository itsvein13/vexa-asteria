import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";

export default {

    data: new SlashCommandBuilder()
        .setName("faq-setup")
        .setDescription("Send the FAQ panels.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        // Banner FAQ
        const banner = new EmbedBuilder()
            .setColor("#7C3AED")
            .setImage("https://media.discordapp.net/attachments/1406140289344602192/1524289547280846878/FAQ.png?ex=6a4f34c4&is=6a4de344&hm=3c35ffd3ec8b2a4fd3e98ca088a6a67f68058bc44a048d17b12ce320ceee8675&=&format=webp&quality=lossless&width=1526&height=859");

        // Getting Started
        const gettingStarted = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("📖 Getting Started")
            .setDescription([
                "Welcome to **Synd1cate**!",
                "",
                "🇮🇩 **Bagaimana cara unlock server?**",
                "> Pilih role di **#🎭・role-menu**.",
                "",
                "🇺🇸 **How do I unlock the server?**",
                "> Choose your roles in **#🎭・role-menu**.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "🇮🇩 **Bagaimana mendapatkan Game Roles?**",
                "> Pilih game favoritmu di Role Menu.",
                "",
                "🇺🇸 **How do I get Game Roles?**",
                "> Choose your favorite games in the Role Menu.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "🇮🇩 **Bagaimana menjadi Streamer?**",
                "> Pilih **Yes** pada menu Streamer.",
                "",
                "🇺🇸 **How do I become a Streamer?**",
                "> Select **Yes** in the Streamer menu."
            ].join("\n"))
            .setFooter({
                text: "Powered by Vexa"
            });

        // Community
        const community = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("🎮 Community")
            .setDescription([
                "🇮🇩 **Di mana upload screenshot?**",
                "> Gunakan **#📷・media**.",
                "",
                "🇺🇸 **Where can I share screenshots?**",
                "> Use **#📷・media**.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "🇮🇩 **Boleh promosi?**",
                "> Ya, hanya di **#💲・promo**.",
                "",
                "🇺🇸 **Can I advertise?**",
                "> Yes, only in **#💲・promo**.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "🇮🇩 **Server ini main game apa aja?**",
                "> Need For Speed\n> Racing Master\n> GTA V\n> Delta Force\n> Valorant\n> PUBG\n> Roblox\n> Minecraft\n> Counter-Strike 2\n> Mobile Legends",
                "",
                "🇺🇸 **What games does this server support?**",
                "> NFS • Racing Master • GTA V • Delta Force • Valorant • PUBG • Roblox • Minecraft • CS2 • Mobile Legends"
            ].join("\n"))
            .setFooter({
                text: "Powered by Vexa"
            });

        // About Vexa
        const vexa = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("🤖 About Vexa")
            .setDescription([
                "**🇮🇩 Apa itu Vexa?**",
                "> Vexa adalah bot resmi Synd1cate yang dibuat khusus untuk mengelola role, komunitas, event, utilitas, dan berbagai sistem otomatis.",
                "",
                "**🇺🇸 What is Vexa?**",
                "> Vexa is Synd1cate's official bot built to manage roles, community features, events, utilities, and automation.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "**🇮🇩 Saya menemukan bug.**",
                "> Laporkan kepada Staff atau Owner.",
                "",
                "**🇺🇸 I found a bug.**",
                "> Please report it to a Staff member or the Owner.",
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "",
                "💜 **Need more help?**",
                "> Contact any Staff member.",
                "",
                "**Powered by Vexa × Synd1cate**"
            ].join("\n"))
            .setFooter({
                text: "Powered by Vexa"
            });

        await interaction.reply({
            embeds: [
                banner,
                gettingStarted,
                community,
                vexa
            ]
        });

    }

}