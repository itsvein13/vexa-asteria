import {
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";

import {
    EMBED_COLOR,
    EMBED_FOOTER,
    BANNERS
} from "../../config/constants.js";

import {
    getMainRole,
    getGames,
    getVibe,
    getCreator,
    formatDate
} from "../../utils/profileUtils.js";

export default {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your Synd1cate profile.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("View another member's profile.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const member =
            interaction.options.getMember("member") ??
            interaction.member;

        const user = member.user;

        const embed = new EmbedBuilder()

            .setColor(EMBED_COLOR)

            .setImage(BANNERS.PROFILE)

            .setThumbnail(
                user.displayAvatarURL({
                    extension: "png",
                    size: 512
                })
            )

            .setDescription([
                `# 👤 ${member.displayName}`,
                `> @${user.username}`,
                "",
                `${getMainRole(member)}`
            ].join("\n"))

            .addFields(

                {
                    name: "🎮 Games",
                    value: getGames(member),
                    inline: false
                },

                {
                    name: "✨ Vibe",
                    value: getVibe(member),
                    inline: true
                },

                {
                    name: "📹 Creator",
                    value: getCreator(member),
                    inline: true
                },

                {
                    name: "📅 Joined Synd1cate",
                    value: `> ${formatDate(member.joinedTimestamp)}`,
                    inline: true
                },

                {
                    name: "🗓 Discord Since",
                    value: `> ${formatDate(user.createdTimestamp)}`,
                    inline: true
                }

            )

            .setFooter(EMBED_FOOTER);

        await interaction.reply({

            embeds: [embed]

        });

    }

};