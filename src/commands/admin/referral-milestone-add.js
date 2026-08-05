import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { addMilestone } from "../../database/referralRewards.js";

export default {

    data: new SlashCommandBuilder()
        .setName("referral-milestone-add")
        .setDescription("Add a new referral milestone reward.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option
                .setName("threshold")
                .setDescription("Active invites required to earn this reward.")
                .setMinValue(1)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("reward")
                .setDescription("Shards awarded at this threshold.")
                .setMinValue(1)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("label")
                .setDescription("Display name for this tier (e.g. 'Gold Recruiter').")
                .setRequired(true)
        ),

    async execute(interaction) {

        const threshold = interaction.options.getInteger("threshold");
        const reward = interaction.options.getInteger("reward");
        const label = interaction.options.getString("label");

        const added = addMilestone(interaction.guild.id, threshold, reward, label);

        if (!added) {
            await interaction.reply({
                content: `⚠️ Milestone **${threshold} invite** sudah ada. Pakai \`/referral-milestone-remove\` dulu kalau mau ganti angkanya.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.reply({
            content: `✅ Milestone **${threshold} invite** → **${label}** (${reward.toLocaleString()} 💎) ditambahkan.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
