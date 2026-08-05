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
        .setName("unmute")
        .setDescription("Remove an active timeout from a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to unmute.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for lifting the mute.")
                .setMaxLength(300)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const targetMember = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!targetMember) {
            await interaction.reply({ content: "❌ Member tidak ditemukan di server ini.", flags: MessageFlags.Ephemeral });
            return;
        }

        if (!targetMember.communicationDisabledUntilTimestamp || targetMember.communicationDisabledUntilTimestamp < Date.now()) {
            await interaction.reply({ content: "❌ Member ini sedang tidak di-mute.", flags: MessageFlags.Ephemeral });
            return;
        }

        const blocked = canModerate(interaction, user, targetMember);

        if (blocked) {
            await interaction.reply({ content: `❌ ${blocked}`, flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await targetMember.timeout(null, reason);
        } catch (error) {
            await interaction.reply({
                content: `❌ Gagal unmute: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { caseNumber, logged } = await logModAction(interaction.guild, {
            type: "unmute",
            user,
            moderator: interaction.user,
            reason
        });

        const dmSent = await dmModNotice(user, interaction.guild, { type: "unmute", reason });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `🔊 ${user} telah di-unmute — **Case #${caseNumber}**.`,
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
