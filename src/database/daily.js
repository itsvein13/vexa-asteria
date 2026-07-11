import db from "./db.js";

// ==========================
// Konfigurasi daily reward
// ==========================

export const DAILY_BASE_XP = 100;
export const DAILY_STREAK_BONUS_XP = 10;  // per hari streak (mulai hari ke-2)
export const DAILY_STREAK_BONUS_CAP = 7;  // bonus mentok di +70 (hari ke-8 dst flat)

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Nomor hari kalender WIB untuk sebuah timestamp.
 * Dua timestamp dengan dayKey sama = hari WIB yang sama.
 * Reset klaim terjadi tiap 00:00 WIB.
 */
export function wibDayKey(timestampMs) {
    return Math.floor((timestampMs + WIB_OFFSET_MS) / DAY_MS);
}

/**
 * Timestamp (ms) 00:00 WIB berikutnya setelah `timestampMs` —
 * dipakai buat nunjukin countdown "bisa klaim lagi <t:...:R>".
 */
export function nextResetAt(timestampMs) {
    return (wibDayKey(timestampMs) + 1) * DAY_MS - WIB_OFFSET_MS;
}

/**
 * XP reward untuk streak tertentu.
 * Hari 1 = 100, hari 2 = 110, ... hari 8+ = 170 (flat).
 */
export function rewardForStreak(streak) {
    const bonusDays = Math.min(Math.max(streak - 1, 0), DAILY_STREAK_BONUS_CAP);
    return DAILY_BASE_XP + bonusDays * DAILY_STREAK_BONUS_XP;
}

const getRow = db.prepare(
    "SELECT last_claim_at, streak FROM daily WHERE user_id = ? AND guild_id = ?"
);

/**
 * Streak daily member untuk ditampilkan (mis. di profile card).
 * Balikin 0 kalau streak sudah putus (terakhir klaim sebelum kemarin).
 */
export function getDailyStreak(userId, guildId, now = Date.now()) {

    const row = getRow.get(userId, guildId);
    if (!row) return 0;

    const alive = wibDayKey(row.last_claim_at) >= wibDayKey(now) - 1;
    return alive ? row.streak : 0;

}

const upsertClaim = db.prepare(`
    INSERT INTO daily (user_id, guild_id, last_claim_at, streak)
    VALUES (@userId, @guildId, @lastClaimAt, @streak)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET last_claim_at = @lastClaimAt, streak = @streak
`);

/**
 * Coba klaim daily reward.
 *
 * Balikin:
 * - { claimed: false, streak, nextResetAt }             → sudah klaim hari ini
 * - { claimed: true, reward, streak, streakContinued, nextResetAt } → sukses
 *
 * Streak lanjut kalau klaim terakhir tepat kemarin (WIB);
 * bolong sehari saja → streak balik ke 1.
 */
export function claimDaily(userId, guildId, now = Date.now()) {

    const row = getRow.get(userId, guildId);
    const todayKey = wibDayKey(now);
    const lastKey = row ? wibDayKey(row.last_claim_at) : null;

    if (lastKey === todayKey) {
        return {
            claimed: false,
            streak: row.streak,
            nextResetAt: nextResetAt(now)
        };
    }

    const streakContinued = lastKey === todayKey - 1;
    const streak = streakContinued ? row.streak + 1 : 1;

    upsertClaim.run({
        userId,
        guildId,
        lastClaimAt: now,
        streak
    });

    return {
        claimed: true,
        reward: rewardForStreak(streak),
        streak,
        streakContinued,
        nextResetAt: nextResetAt(now)
    };

}
