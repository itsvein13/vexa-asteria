import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import REFERRAL_MILESTONE_PRESET from "../../config/referralMilestonePreset.js";
import { milestoneExists, addMilestone } from "../../database/referralRewards.js";
import { syncAllReferralRewards } from "../../utils/syncAllReferralRewards.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("referral-rewards-setup")
        .setDescription("Create the default referral milestone ladder (3 -> 50 invites).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild = interaction.guild;

        let created = 0;
        let skipped = 0;
        const lines = [];

        for (const tier of REFERRAL_MILESTONE_PRESET) {

            // Idempotent — threshold yang sudah dipetakan dilewati, jadi
            // command ini aman dijalankan ulang.
            if (milestoneExists(guild.id, tier.threshold)) {
                skipped++;
                lines.push(`⏭️ ${tier.threshold} invite — sudah ada, dilewati.`);
                continue;
            }

            addMilestone(guild.id, tier.threshold, tier.reward, tier.label);
            created++;
            lines.push(`✅ ${tier.threshold} invite — ${tier.emoji} **${tier.label}** (${tier.reward.toLocaleString()} 💎)`);

        }

        // Auto-sync: inviter yang invite aktifnya udah cukup langsung
        // dapat reward, tanpa admin perlu ingat jalankan /referral-sync
        // terpisah — pola sama kayak /level-roles-setup.
        const { checked, granted, totalReward } = await syncAllReferralRewards(guild);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("📨 Referral Rewards Setup")
            .setDescription([
                lines.join("\n"),
                "",
                `**${created}** milestone dibuat, **${skipped}** dilewati.`,
                "",
                "**🔄 Auto-sync inviter existing**",
                `Dicek: **${checked}** inviter • 🏅 milestone baru diberikan: **${granted}** • 💎 total Shards dibagikan: **${totalReward.toLocaleString()}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.editReply({ embeds: [embed] });

    }

};
