import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

import { getMilestones } from "../../database/referralRewards.js";
import { getInviteStats } from "../../database/inviteTracking.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("referral-milestones")
        .setDescription("See the referral reward tiers and how close you are."),

    async execute(interaction) {

        const ladder = getMilestones(interaction.guild.id);
        const { active } = getInviteStats(interaction.guild.id, interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("📨 Referral Milestones")
            .setFooter(EMBED_FOOTER);

        if (!ladder.length) {

            embed.setDescription("Belum ada milestone referral di server ini.");

        } else {

            const lines = ladder.map(m => {
                const reached = active >= m.threshold;
                return `${reached ? "✅" : "⬜"} **${m.threshold} invite** — ${m.label} (${m.reward.toLocaleString()} 💎)`;
            });

            embed.setDescription([
                `Invite aktif kamu sekarang: **${active}**`,
                "",
                ...lines
            ].join("\n"));

        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
