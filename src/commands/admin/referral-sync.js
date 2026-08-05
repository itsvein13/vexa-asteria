import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { syncAllReferralRewards } from "../../utils/syncAllReferralRewards.js";
import { getMilestones } from "../../database/referralRewards.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("referral-sync")
        .setDescription("Re-check every inviter against the current milestone ladder.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild = interaction.guild;

        if (getMilestones(guild.id).length === 0) {
            await interaction.editReply({
                content: "⚠️ Server ini belum punya milestone referral. Pakai `/referral-rewards-setup` atau `/referral-milestone-add` dulu."
            });
            return;
        }

        const { checked, granted, totalReward } = await syncAllReferralRewards(guild);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🔄 Referral Sync Selesai")
            .setDescription([
                `Inviter dicek: **${checked}**`,
                `🏅 Milestone baru diberikan: **${granted}**`,
                `💎 Total Shards dibagikan: **${totalReward.toLocaleString()}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.editReply({ embeds: [embed] });

    }

};
