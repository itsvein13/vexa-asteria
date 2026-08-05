import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getAutomodLogChannel } from "../database/automodConfig.js";
import { EMBED_FOOTER } from "../config/constants.js";
import COLORS from "../config/colors.js";
import safeSend from "./safeSend.js";

/**
 * Tindak lanjuti cross-post spam yang terdeteksi checkCrossPostSpam():
 * hapus pesan-pesan buktinya, ban pelakunya, dan laporkan lengkap
 * dengan bukti ke channel log admin (biar bisa di-unban manual kalau
 * ternyata salah tangkap).
 */
export async function handleCrossPostSpam(guild, messages) {

    const author = messages[0].author;

    // Hapus semua pesan bukti — best-effort, satu gagal (mis. sudah
    // dihapus user/mod lain) ga boleh menghentikan sisanya.
    await Promise.allSettled(messages.map(m => m.delete().catch(() => {})));

    const channelList = [...new Set(messages.map(m => `<#${m.channel.id}>`))].join(", ");

    let banned = false;

    if (guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {

        try {

            await guild.members.ban(author.id, {
                reason: "Vexa AutoMod: cross-channel spam terdeteksi (pola giveaway scam)",
                deleteMessageSeconds: 3600 // bonus: sekalian bersihin pesan 1 jam terakhir user ini
            });

            banned = true;

        } catch (error) {
            console.error(`AutoMod gagal ban ${author.tag}: ${error.message}`);
        }

    } else {
        console.warn("⚠️ AutoMod: bot tidak punya izin Ban Members.");
    }

    const logChannelId = getAutomodLogChannel(guild.id);
    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;

    if (!logChannel) return;

    const preview = messages[0].content
        ? `"${messages[0].content.slice(0, 200)}"`
        : "*(tanpa teks, hanya lampiran)*";

    const attachmentNames = [...messages[0].attachments.values()].map(a => a.name).join(", ");

    const embed = new EmbedBuilder()
        .setColor(banned ? COLORS.danger : COLORS.gold)
        .setTitle(banned ? "🚨 AutoMod: Spam terdeteksi & di-ban" : "⚠️ AutoMod: Spam terdeteksi (ban GAGAL)")
        .setDescription([
            `Member: ${author} (\`${author.tag}\`, \`${author.id}\`)`,
            `Channel: ${channelList}`,
            `Pesan terhapus: **${messages.length}**`,
            "",
            `Konten: ${preview}`,
            attachmentNames ? `Lampiran: ${attachmentNames}` : "",
            "",
            banned
                ? "-# Kalau ini salah deteksi, unban manual dari Server Settings → Bans."
                : "-# Bot tidak punya izin **Ban Members** — tindak lanjuti manual."
        ].filter(Boolean).join("\n"))
        .setFooter(EMBED_FOOTER)
        .setTimestamp();

    await safeSend(logChannel, { embeds: [embed] });

}
