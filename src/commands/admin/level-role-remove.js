import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { removeLevelRole } from "../../database/levelRoles.js";

export default {

    data: new SlashCommandBuilder()
        .setName("level-role-remove")
        .setDescription("Unlink a level reward (the Discord role itself is kept).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option
                .setName("level")
                .setDescription("Level to unlink.")
                .setRequired(true)
        ),

    async execute(interaction) {

        const level = interaction.options.getInteger("level");
        const removed = removeLevelRole(interaction.guild.id, level);

        await interaction.reply({
            content: removed
                ? `✅ Level **${level}** dilepas dari tangga reward. Role Discord-nya masih ada — hapus manual kalau tidak dipakai lagi.`
                : `⚠️ Level **${level}** tidak ada di tangga reward.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
