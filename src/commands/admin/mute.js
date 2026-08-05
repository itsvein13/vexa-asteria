import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { canModerate, logModAction, dmModNotice } from "../../utils/modLog.js";
import { parseDuration, formatDuration } from "../../utils/duration.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Timeout a member for a set duration.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to mute.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("duration")
                .setDescription("e.g. 10m, 1h, 7d (max 28d).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the mute.")
                .setRequired(true)
                .setMaxLength(300)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const durationInput = interaction.options.getString("duration");
        const reason = interaction.options.getString("reason");

        const durationMs = parseDuration(durationInput);

        if (!durationMs) {
            await interaction.reply({
                content: "❌ Format durasi tidak valid. Gunakan angka + satuan (s/m/h/d/w), misal `10m`, `1h`, `7d`. Maksimal 28 hari.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

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

        try {
            await targetMember.timeout(durationMs, reason);
        } catch (error) {
            await interaction.reply({
                content: `❌ Gagal mute: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { caseNumber, logged } = await logModAction(interaction.guild, {
            type: "mute",
            user,
            moderator: interaction.user,
            reason,
            durationMs
        });

        const dmSent = await dmModNotice(user, interaction.guild, { type: "mute", reason, durationMs });

        const until = Math.floor((Date.now() + durationMs) / 1000);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `🔇 ${user} di-mute selama **${formatDuration(durationMs)}** — **Case #${caseNumber}**.`,
                `Berakhir: <t:${until}:R>`,
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
