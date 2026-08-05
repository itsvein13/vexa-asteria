import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { canModerate, logModAction, dmModNotice } from "../../utils/modLog.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

const DELETE_SECONDS = {
    none: 0,
    "1h": 60 * 60,
    "6h": 6 * 60 * 60,
    "1d": 24 * 60 * 60,
    "3d": 3 * 24 * 60 * 60,
    "7d": 7 * 24 * 60 * 60
};

export default {

    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member from the server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to ban (works even if they already left).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the ban.")
                .setRequired(true)
                .setMaxLength(300)
        )
        .addStringOption(option =>
            option
                .setName("delete_messages")
                .setDescription("Delete their recent messages too?")
                .addChoices(
                    { name: "Don't delete", value: "none" },
                    { name: "Last 1 hour", value: "1h" },
                    { name: "Last 6 hours", value: "6h" },
                    { name: "Last 24 hours", value: "1d" },
                    { name: "Last 3 days", value: "3d" },
                    { name: "Last 7 days", value: "7d" }
                )
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason");
        const deleteChoice = interaction.options.getString("delete_messages") ?? "none";

        const targetMember = await interaction.guild.members.fetch(user.id).catch(() => null);

        const blocked = canModerate(interaction, user, targetMember);

        if (blocked) {
            await interaction.reply({ content: `❌ ${blocked}`, flags: MessageFlags.Ephemeral });
            return;
        }

        // DM sebelum ban — sesudah di-ban, member ga akan share guild lagi
        // dengan Vexa jadi DM kemungkinan besar gagal.
        const dmSent = await dmModNotice(user, interaction.guild, { type: "ban", reason });

        try {
            await interaction.guild.members.ban(user.id, {
                reason,
                deleteMessageSeconds: DELETE_SECONDS[deleteChoice]
            });
        } catch (error) {
            await interaction.reply({
                content: `❌ Gagal ban: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { caseNumber, logged } = await logModAction(interaction.guild, {
            type: "ban",
            user,
            moderator: interaction.user,
            reason
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `🔨 ${user.tag} telah di-ban — **Case #${caseNumber}**.`,
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
