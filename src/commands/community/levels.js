import {
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";

import { getLevelData, getRank } from "../../database/levels.js";
import { getTier } from "../../config/tiers.js";
import { EMBED_FOOTER } from "../../config/constants.js";

function progressBar(current, needed, length = 20) {

    const ratio = needed > 0 ? Math.min(current / needed, 1) : 0;
    const filled = Math.round(ratio * length);

    return "▰".repeat(filled) + "▱".repeat(length - filled);

}

export default {

    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Check your (or someone else's) level and rank.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Check another member.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const member =
            interaction.options.getMember("member") ??
            interaction.member;

        const levelData = getLevelData(member.id, interaction.guild.id);
        const rank = getRank(member.id, interaction.guild.id);
        const tier = getTier(member);

        const bar = progressBar(levelData.currentXP, levelData.xpNeeded);
        const percent = levelData.xpNeeded > 0
            ? Math.floor((levelData.currentXP / levelData.xpNeeded) * 100)
            : 0;

        const embed = new EmbedBuilder()
            .setColor(tier.color)
            .setAuthor({
                name: member.displayName,
                iconURL: member.user.displayAvatarURL({ extension: "png", size: 128 })
            })
            .setDescription([
                `**Level ${levelData.level}** • Rank **#${rank}**`,
                "",
                `${bar}`,
                `${levelData.currentXP.toLocaleString()} / ${levelData.xpNeeded.toLocaleString()} XP (${percent}%)`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};