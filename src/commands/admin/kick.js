import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { canModerate, logModAction, dmModNotice } from "../../utils/modLog.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member from the server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to kick.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the kick.")
                .setRequired(true)
                .setMaxLength(300)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason");

        const targetMember = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!targetMember) {
            await interaction.reply({ content: "❌ Member tidak ditemukan di server ini.", flags: MessageFlags.Ephemeral });
            return;
        }

        const blocked = canModerate(interaction, user, targetMember);

        if (blocked) {
            await interaction.reply({ content: `❌ ${blocked}`, flags: MessageFlags.Ephemeral });
            return;
        }

        // DM sebelum kick — begitu di-kick, bot udah ga bisa lagi kirim DM
        // (masih di server = masih bisa dikirimin, kick dulu baru DM = telat).
        const dmSent = await dmModNotice(user, interaction.guild, { type: "kick", reason });

        try {
            await targetMember.kick(reason);
        } catch (error) {
            await interaction.reply({
                content: `❌ Gagal kick: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { caseNumber, logged } = await logModAction(interaction.guild, {
            type: "kick",
            user,
            moderator: interaction.user,
            reason
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `👢 ${user.tag} telah di-kick — **Case #${caseNumber}**.`,
                `Alasan: ${reason}`,
                dmSent ? "" : "-# DM ke member gagal terkirim (kemungkinan DM tertutup)."
            ].filter(Boolean).join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

        if (!logged) {
            await interaction.followUp({
                content: "-# ⚠️ Belum ada mod-log channel — jalankan `/modlog-setup` supaya case tercatat juga di sana.",
                flags: MessageFlags.Ephemeral
            });
        }

    }

};
