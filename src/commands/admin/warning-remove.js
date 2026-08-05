import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { removeWarning, getCase } from "../../database/modCases.js";
import { logModAction } from "../../utils/modLog.js";

export default {

    data: new SlashCommandBuilder()
        .setName("warning-remove")
        .setDescription("Remove (revoke) a warning by its case number.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addIntegerOption(option =>
            option
                .setName("case")
                .setDescription("Case number to remove (see /warnings).")
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {

        const caseNumber = interaction.options.getInteger("case");
        const target = getCase(interaction.guild.id, caseNumber);

        const removed = removeWarning(interaction.guild.id, caseNumber);

        if (!removed) {
            await interaction.reply({
                content: `❌ Case #${caseNumber} tidak ditemukan atau bukan warning aktif.`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const targetUser = await interaction.client.users.fetch(target.userId).catch(() => null);

        await logModAction(interaction.guild, {
            type: "warning-remove",
            user: targetUser ?? { id: target.userId, tag: `Unknown User (${target.userId})` },
            moderator: interaction.user,
            reason: `Menghapus Case #${caseNumber} (alasan asli: ${target.reason})`
        });

        await interaction.reply({
            content: `✅ Case #${caseNumber} (warning untuk <@${target.userId}>) telah dihapus.`
        });

    }

};
