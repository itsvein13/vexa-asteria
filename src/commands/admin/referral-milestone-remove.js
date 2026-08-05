import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { removeMilestone } from "../../database/referralRewards.js";

export default {

    data: new SlashCommandBuilder()
        .setName("referral-milestone-remove")
        .setDescription("Remove a referral milestone (past claims are not clawed back).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option
                .setName("threshold")
                .setDescription("Milestone threshold to remove.")
                .setRequired(true)
        ),

    async execute(interaction) {

        const threshold = interaction.options.getInteger("threshold");
        const removed = removeMilestone(interaction.guild.id, threshold);

        await interaction.reply({
            content: removed
                ? `✅ Milestone **${threshold} invite** dihapus. Member yang udah pernah dapet reward ini TETAP pegang Shards-nya — cuma ga ada lagi member baru yang bisa klaim.`
                : `⚠️ Milestone **${threshold} invite** tidak ditemukan.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
