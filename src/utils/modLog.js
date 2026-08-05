import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { createCase } from "../database/modCases.js";
import { getModLogChannel } from "../database/modLogConfig.js";
import { EMBED_FOOTER } from "../config/constants.js";
import { formatDuration } from "./duration.js";
import COLORS from "../config/colors.js";
import safeSend from "./safeSend.js";

const ACTION_META = {
    warn: { label: "Warn", emoji: "⚠️", color: COLORS.gold },
    "warning-remove": { label: "Warning Removed", emoji: "🗑️", color: COLORS.muted },
    mute: { label: "Mute (Timeout)", emoji: "🔇", color: COLORS.accent },
    unmute: { label: "Unmute", emoji: "🔊", color: COLORS.success },
    kick: { label: "Kick", emoji: "👢", color: COLORS.danger },
    ban: { label: "Ban", emoji: "🔨", color: COLORS.danger },
    unban: { label: "Unban", emoji: "🕊️", color: COLORS.success }
};

/**
 * Cek apakah invoker boleh memoderasi targetUser/targetMember:
 * - Ga bisa ke diri sendiri, ke Vexa, atau ke owner server.
 * - Role invoker harus lebih tinggi dari role target (bypass kalau
 *   invoker owner/Administrator).
 * - Role Vexa sendiri juga harus lebih tinggi dari target, kalau
 *   ngga nanti .kick()/.ban()/.timeout() bakal gagal dengan error
 *   yang membingungkan — dicek duluan biar pesannya jelas.
 *
 * Balikin null kalau boleh lanjut, atau string alasan penolakan.
 */
export function canModerate(interaction, targetUser, targetMember) {

    if (targetUser.id === interaction.user.id) {
        return "Kamu tidak bisa melakukan aksi ini ke diri sendiri.";
    }

    if (targetUser.id === interaction.client.user.id) {
        return "Aksi ini tidak bisa dilakukan ke Vexa.";
    }

    if (targetUser.id === interaction.guild.ownerId) {
        return "Tidak bisa melakukan aksi moderasi ke pemilik server.";
    }

    if (targetMember) {

        const isOwnerOrAdmin = interaction.member.id === interaction.guild.ownerId
            || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        const modTop = interaction.member.roles.highest.position;
        const targetTop = targetMember.roles.highest.position;

        if (!isOwnerOrAdmin && targetTop >= modTop) {
            return "Target punya role yang setara atau lebih tinggi dari kamu.";
        }

        const botTop = interaction.guild.members.me.roles.highest.position;

        if (targetTop >= botTop) {
            return "Role **Vexa** harus diposisikan lebih tinggi dari role target di Server Settings → Roles supaya bisa memoderasi member ini.";
        }

    }

    return null;

}

/**
 * Catat satu case moderasi ke database (nomor urut otomatis) dan
 * kirim laporannya ke mod-log channel kalau sudah dikonfigurasi
 * (/modlog-setup). Balikin { caseNumber, logged } — logged = false
 * kalau channel-nya belum diset atau gagal dikirim, tapi case tetap
 * tersimpan di database (audit trail ga pernah hilang).
 */
export async function logModAction(guild, { type, user, moderator, reason, durationMs = null }) {

    const { caseNumber } = createCase(guild.id, {
        type,
        userId: user.id,
        moderatorId: moderator.id,
        reason,
        durationMs
    });

    const logChannelId = getModLogChannel(guild.id);
    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;

    if (!logChannel) return { caseNumber, logged: false };

    const meta = ACTION_META[type];

    const lines = [
        `Member: <@${user.id}> (\`${user.tag}\`, \`${user.id}\`)`,
        `Moderator: <@${moderator.id}>`,
        `Alasan: ${reason}`
    ];

    if (durationMs) lines.push(`Durasi: **${formatDuration(durationMs)}**`);

    const embed = new EmbedBuilder()
        .setColor(meta.color)
        .setTitle(`${meta.emoji} ${meta.label} — Case #${caseNumber}`)
        .setDescription(lines.join("\n"))
        .setFooter(EMBED_FOOTER)
        .setTimestamp();

    const sent = await safeSend(logChannel, { embeds: [embed] });

    return { caseNumber, logged: Boolean(sent) };

}

/**
 * DM best-effort ke target buat kasih tau kena aksi moderasi apa.
 * Banyak user nutup DM dari server bareng — gagal itu wajar, jadi
 * ini cuma "nice to have", ga boleh bikin command utamanya gagal.
 * Balikin true/false (berhasil terkirim atau tidak).
 */
export async function dmModNotice(user, guild, { type, reason, durationMs = null }) {

    const meta = ACTION_META[type];

    const lines = [`${meta.emoji} Kamu menerima **${meta.label}** di **${guild.name}**.`, `Alasan: ${reason}`];

    if (durationMs) lines.push(`Durasi: **${formatDuration(durationMs)}**`);

    try {
        await user.send({ content: lines.join("\n") });
        return true;
    } catch {
        return false;
    }

}
