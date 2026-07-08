import { EmbedBuilder } from "discord.js";

export default {

    customId: "faq-menu",

    async execute(interaction) {

        const value = interaction.values[0];

        const embed = new EmbedBuilder()
            .setColor("#7C3AED")
            .setFooter({
                text: "Powered by Vexa"
            })
            // ===== Banner =====
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1524289547280846878/FAQ.png?ex=6a4f34c4&is=6a4de344&hm=3c35ffd3ec8b2a4fd3e98ca088a6a67f68058bc44a048d17b12ce320ceee8675&");

        switch (value) {

            case "getting_started":

                embed
                    .setTitle("🔐 Getting Started")
                    .setDescription([
                        "**How do I unlock the server?**",
                        "> Verify yourself in **#✅・verify**.",
                        "",
                        "**How do I get access to every channel?**",
                        "> Once verified, you'll automatically receive the **Wanderer** role.",
                        "",
                        "**Where do I choose my roles?**",
                        "> Head over to **#🎭・role-menu** and customize your profile."
                    ].join("\n"));

                break;

            case "roles":

                embed
                    .setTitle("🎭 Roles")
                    .setDescription([
                        "**Can I change my roles later?**",
                        "> Yep! You can update them anytime.",
                        "",
                        "**Can I choose multiple games?**",
                        "> Absolutely. Pick every game you play.",
                        "",
                        "**Can I change my vibe?**",
                        "> Of course! Just select a new one in the Role Menu.",
                        "",
                        "**What's the Streamer role for?**",
                        "> It's for members who create content or livestream."
                    ].join("\n"));

                break;

            case "community":

                embed
                    .setTitle("💬 Community")
                    .setDescription([
                        "**Where can I post screenshots or clips?**",
                        "> Share them in **#📷・media**.",
                        "",
                        "**Can I advertise my content?**",
                        "> Yes, but only in **#💲・promo**.",
                        "",
                        "**Be respectful.**",
                        "> Keep the community friendly and welcoming for everyone."
                    ].join("\n"));

                break;

            case "vexa":

                embed
                    .setTitle("🤖 About Vexa")
                    .setDescription([
                        "**Who is Vexa?**",
                        "> Vexa is Synd1cate's custom-built Discord bot.",
                        "",
                        "**What can Vexa do?**",
                        "> • Verification",
                        "> • Role Management",
                        "> • Interactive FAQ",
                        "> • Community Utilities",
                        "> • And much more coming soon!"
                    ].join("\n"));

                break;

            case "support":

                embed
                    .setTitle("🆘 Support")
                    .setDescription([
                        "**Need help?**",
                        "> Contact any Staff member.",
                        "",
                        "**Found a bug?**",
                        "> Let us know so we can fix it.",
                        "",
                        "**Still can't find an answer?**",
                        "> Don't hesitate to reach out — we're happy to help."
                    ].join("\n"));

                break;

        }

        await interaction.update({
            embeds: [embed]
        });

    }

}