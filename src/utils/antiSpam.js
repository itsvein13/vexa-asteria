import {
    CROSS_POST_CHANNEL_THRESHOLD,
    CROSS_POST_WINDOW_MS,
    TRACKING_CLEANUP_INTERVAL_MS
} from "../config/antiSpamRules.js";

// key: `${guildId}:${userId}` -> [{ channelId, signature, message, timestamp }]
// In-memory sengaja — sifatnya sesaat (window 10 detik), ga perlu
// tahan restart, dan jauh lebih cepat daripada bolak-balik ke SQLite
// untuk tiap pesan yang masuk.
const recentMessages = new Map();

const URL_REGEX = /https?:\/\/\S+/i;

/**
 * "Sidik jari" konten pesan buat dibandingkan lintas channel —
 * teks, lampiran (nama+ukuran), dan URL pertama kalau ada.
 */
function buildSignature(message) {

    const text = message.content.trim().toLowerCase().replace(/\s+/g, " ");

    const attachmentSig = [...message.attachments.values()]
        .map(a => `${a.name}:${a.size}`)
        .sort()
        .join("|");

    const urlMatch = message.content.match(URL_REGEX);
    const urlSig = urlMatch ? urlMatch[0].toLowerCase() : "";

    return `${text}::${attachmentSig}::${urlSig}`;

}

/**
 * Pesan "berpotensi giveaway scam" — punya link atau lampiran.
 * Spam teks polos tanpa keduanya sengaja TIDAK ditandai, biar
 * risiko salah tangkap chat biasa yang kebetulan mirip tetap rendah.
 */
function isQualifying(message) {
    return message.attachments.size > 0 || URL_REGEX.test(message.content);
}

/**
 * Cek apakah pesan ini bagian dari pola cross-post spam: pesan
 * identik dari user yang sama, dikirim ke >= CROSS_POST_CHANNEL_THRESHOLD
 * channel berbeda dalam CROSS_POST_WINDOW_MS.
 *
 * Balikin array Message (bukti, termasuk pesan ini) kalau terdeteksi,
 * atau null kalau belum / tidak qualifying.
 */
export function checkCrossPostSpam(message) {

    if (!isQualifying(message)) return null;

    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();

    const entries = (recentMessages.get(key) ?? [])
        .filter(e => now - e.timestamp < CROSS_POST_WINDOW_MS);

    const signature = buildSignature(message);

    entries.push({ channelId: message.channel.id, signature, message, timestamp: now });

    const matching = entries.filter(e => e.signature === signature);
    const distinctChannels = new Set(matching.map(e => e.channelId));

    if (distinctChannels.size >= CROSS_POST_CHANNEL_THRESHOLD) {

        // Reset — begitu ke-trigger, mulai bersih lagi buat user ini
        // (menghindari trigger dobel dari sisa entries yang sama).
        recentMessages.delete(key);

        return matching.map(e => e.message);

    }

    recentMessages.set(key, entries);
    return null;

}

// Sapu berkala entri basi biar Map ga bertumbuh tanpa batas selama
// bot berjalan lama (window-nya cuma 10 detik, tapi user yang idle
// menyisakan key kosong kalau ga dibersihin).
setInterval(() => {

    const now = Date.now();

    for (const [key, entries] of recentMessages) {

        const alive = entries.filter(e => now - e.timestamp < CROSS_POST_WINDOW_MS);

        if (alive.length === 0) recentMessages.delete(key);
        else recentMessages.set(key, alive);

    }

}, TRACKING_CLEANUP_INTERVAL_MS);
