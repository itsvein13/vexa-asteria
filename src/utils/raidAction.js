import { EmbedBuilder } from "discord.js";
import { getAutomodLogChannel } from "../database/automodConfig.js";
import { isNewAccount } from "./antiRaid.js";
import { EMBED_FOOTER } from "../config/constants.js";
import { NEW_ACCOUNT_AGE_MS, RAID_MODE_DURATION_MS } from "../config/antiRaidRules.js";
import COLORS from "../config/colors.js";
import safeSend from "./safeSend.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function accountAgeLabel(user) {
    const days = Math.floor((Date.now() - user.createdTimestamp) / DAY_MS);
    return days <= 0 ? "hari ini" : `${days} hari lalu`;
}

async function getLogChannel(guild) {
    const channelId = getAutomodLogChannel(guild.id);
    return channelId ? guild.channels.cache.get(channelId) : null;
}

/** Kick satu member kalau akunnya masih baru. Balikin true kalau di-kick. */
async function kickIfNewAccount(member, reason) {

    if (!isNewAccount(member.user)) return false;

    try {
        await member.kick(reason);
        return true;
    } catch (error) {
        console.error(`Anti-Raid gagal kick ${member.user.tag}: ${error.message}`);
        return false;
    }

}

/**
 * Dipanggil begitu gelombang join baru saja melewati threshold raid.
 * Cek tiap member dalam gelombang itu — kick yang akunnya masih baru,
 * lalu kirim satu laporan lengkap ke mod-log (/automod-setup).
 */
export async function handleRaidTrigger(guild, burstMembers) {

    const results = [];

    for (const member of burstMembers) {
        const kicked = await kickIfNewAccount(
            member,
            "Vexa Anti-Raid: akun baru terdeteksi dalam gelombang join mencurigakan"
        );
        results.push({ member, kicked });
    }

    const kickedCount = results.filter(r => r.kicked).length;
    const maxAgeDays = Math.floor(NEW_ACCOUNT_AGE_MS / DAY_MS);
    const modeMinutes = Math.floor(RAID_MODE_DURATION_MS / 60000);

    const shown = results.slice(0, 15).map(r =>
        `${r.kicked ? "🚫" : "✅"} <@${r.member.id}> — akun dibuat ${accountAgeLabel(r.member.user)}${r.kicked ? " (di-kick)" : ""}`
    );

    if (results.length > 15) shown.push(`-# ...dan ${results.length - 15} member lainnya.`);

    const embed = new EmbedBuilder()
        .setColor(COLORS.danger)
        .setTitle("🚨 Kemungkinan Raid Terdeteksi")
        .setDescription([
            `**${burstMembers.length}** member join dalam waktu singkat — pola ini mirip raid/bot invasion.`,
            `Auto-kick akun baru (< ${maxAgeDays} hari): **${kickedCount}/${burstMembers.length}**.`,
            "",
            ...shown,
            "",
            `-# Vexa tetap waspada ${modeMinutes} menit ke depan — member baru dengan akun muda yang join`,
            "-# di periode ini akan otomatis di-kick juga. Salah deteksi? Jalankan `/raid-clear`."
        ].join("\n"))
        .setFooter(EMBED_FOOTER)
        .setTimestamp();

    const logChannel = await getLogChannel(guild);

    if (logChannel) {
        await safeSend(logChannel, { embeds: [embed] });
    } else {
        console.warn(`⚠️ Anti-Raid: raid terdeteksi di ${guild.name} tapi belum ada log channel — jalankan /automod-setup.`);
    }

}

/**
 * Dipanggil buat tiap join individual selagi mode raid masih aktif
 * (setelah trigger awal). Kalau akunnya baru, kick + log ringkas.
 * Member dengan akun normal dibiarkan lewat tanpa log (biar ga spam).
 */
export async function handleSuspiciousJoin(member) {

    const kicked = await kickIfNewAccount(
        member,
        "Vexa Anti-Raid: akun baru join selagi mode waspada raid aktif"
    );

    if (!kicked) return;

    const embed = new EmbedBuilder()
        .setColor(COLORS.gold)
        .setTitle("🛡️ Anti-Raid: Auto-Kick")
        .setDescription([
            `${member.user.tag} (\`${member.id}\`) di-kick otomatis.`,
            `Alasan: join selagi mode waspada raid aktif, akun dibuat ${accountAgeLabel(member.user)}.`
        ].join("\n"))
        .setFooter(EMBED_FOOTER)
        .setTimestamp();

    const logChannel = await getLogChannel(member.guild);
    if (logChannel) await safeSend(logChannel, { embeds: [embed] });

}
