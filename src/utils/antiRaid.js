import {
    RAID_JOIN_THRESHOLD,
    RAID_WINDOW_MS,
    RAID_MODE_DURATION_MS,
    NEW_ACCOUNT_AGE_MS
} from "../config/antiRaidRules.js";

// In-memory sengaja — sifatnya sesaat, ga perlu tahan restart, dan
// jauh lebih cepat daripada bolak-balik ke SQLite tiap ada member join.
// key: guildId -> { joins: [{ member, timestamp }], raidActiveUntil: number|null }
const state = new Map();

function getState(guildId) {

    if (!state.has(guildId)) {
        state.set(guildId, { joins: [], raidActiveUntil: null });
    }

    return state.get(guildId);

}

/**
 * Catat satu member join dan cek apakah ini memicu mode raid, atau
 * masih dalam mode raid yang lagi aktif.
 *
 * Balikin:
 * - justTriggered: true kalau join ini yang bikin threshold ke-hit
 *   (baru pertama kali) — burst berisi semua member dalam gelombang itu.
 * - inRaidMode: true kalau guild ini sedang dalam periode waspada
 *   (baik baru saja ke-trigger atau masih dalam durasi sebelumnya).
 */
export function trackJoin(member) {

    const s = getState(member.guild.id);
    const now = Date.now();

    // Buang entry di luar window, lalu catat join ini.
    s.joins = s.joins.filter(entry => now - entry.timestamp < RAID_WINDOW_MS);
    s.joins.push({ member, timestamp: now });

    const alreadyInRaidMode = Boolean(s.raidActiveUntil && s.raidActiveUntil > now);

    if (!alreadyInRaidMode && s.joins.length >= RAID_JOIN_THRESHOLD) {

        s.raidActiveUntil = now + RAID_MODE_DURATION_MS;

        const burst = s.joins.map(entry => entry.member);
        s.joins = []; // reset — biar ga langsung re-trigger di join berikutnya

        return { justTriggered: true, inRaidMode: true, burst };

    }

    return {
        justTriggered: false,
        inRaidMode: Boolean(s.raidActiveUntil && s.raidActiveUntil > now),
        burst: []
    };

}

/** Akun dianggap "baru" (di bawah NEW_ACCOUNT_AGE_MS) — pola khas bot raid. */
export function isNewAccount(user) {
    return Date.now() - user.createdTimestamp < NEW_ACCOUNT_AGE_MS;
}

/** Status mode raid guild ini sekarang — dipakai /raid-status. */
export function isRaidModeActive(guildId) {
    const s = state.get(guildId);
    return Boolean(s?.raidActiveUntil && s.raidActiveUntil > Date.now());
}

/** Sisa waktu mode raid (ms), 0 kalau tidak aktif. Dipakai /raid-status. */
export function raidModeRemainingMs(guildId) {
    const s = state.get(guildId);
    if (!s?.raidActiveUntil) return 0;
    return Math.max(0, s.raidActiveUntil - Date.now());
}

/** Matikan mode raid manual — safety valve kalau ternyata false positive. */
export function endRaidMode(guildId) {
    const s = state.get(guildId);
    if (s) s.raidActiveUntil = null;
}
