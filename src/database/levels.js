import db from "./db.js";

const COOLDOWN_MS = 60 * 1000; // 1 pesan = XP, maksimal tiap 60 detik per user

/**
 * XP yang dibutuhkan untuk naik DARI `level` ke `level + 1`.
 * Formula umum ala bot leveling (MEE6-style curve): makin tinggi level,
 * makin banyak XP yang dibutuhkan.
 */
export function xpForLevel(level) {
    return 5 * level * level + 50 * level + 100;
}

/**
 * Mengubah total XP mentah jadi { level, currentXP, xpNeeded }.
 * currentXP = progress di dalam level saat ini (bukan total XP).
 */
export function computeLevel(totalXP) {

    let level = 0;
    let remaining = totalXP;

    while (remaining >= xpForLevel(level)) {
        remaining -= xpForLevel(level);
        level++;
    }

    return {
        level,
        currentXP: remaining,
        xpNeeded: xpForLevel(level)
    };

}

const getRow = db.prepare(
    "SELECT xp, last_message_at FROM levels WHERE user_id = ? AND guild_id = ?"
);

const upsertXP = db.prepare(`
    INSERT INTO levels (user_id, guild_id, xp, last_message_at)
    VALUES (@userId, @guildId, @xp, @lastMessageAt)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET xp = @xp, last_message_at = @lastMessageAt
`);

/**
 * Ambil data level seorang member. Kalau belum pernah tercatat,
 * balikin default level 0 (bukan error/null) biar caller ga perlu
 * cek "belum ada data" secara terpisah.
 */
export function getLevelData(userId, guildId) {

    const row = getRow.get(userId, guildId);
    const totalXP = row?.xp ?? 0;

    return {
        totalXP,
        ...computeLevel(totalXP)
    };

}

/**
 * Tambah XP karena kirim pesan, dengan cooldown per user supaya
 * ga bisa di-spam buat farming XP. Balikin null kalau lagi kena cooldown.
 * Kalau berhasil, balikin info level (termasuk apakah baru naik level).
 */
export function addMessageXP(userId, guildId) {

    const row = getRow.get(userId, guildId);
    const now = Date.now();

    if (row && now - row.last_message_at < COOLDOWN_MS) {
        return null; // masih cooldown
    }

    const oldXP = row?.xp ?? 0;
    const gained = 15 + Math.floor(Math.random() * 11); // 15-25 XP per pesan
    const newXP = oldXP + gained;

    upsertXP.run({
        userId,
        guildId,
        xp: newXP,
        lastMessageAt: now
    });

    const before = computeLevel(oldXP);
    const after = computeLevel(newXP);

    return {
        gained,
        totalXP: newXP,
        level: after.level,
        currentXP: after.currentXP,
        xpNeeded: after.xpNeeded,
        leveledUp: after.level > before.level
    };

}

/**
 * Tambah XP dari sumber non-pesan (daily reward, event, dsb).
 * Tanpa cooldown — kontrol frekuensi jadi tanggung jawab caller.
 * last_message_at TIDAK disentuh supaya cooldown chat ga ke-reset.
 */
export function addXP(userId, guildId, amount) {

    const row = getRow.get(userId, guildId);
    const oldXP = row?.xp ?? 0;
    const newXP = oldXP + amount;

    upsertXP.run({
        userId,
        guildId,
        xp: newXP,
        lastMessageAt: row?.last_message_at ?? 0
    });

    const before = computeLevel(oldXP);
    const after = computeLevel(newXP);

    return {
        gained: amount,
        totalXP: newXP,
        level: after.level,
        currentXP: after.currentXP,
        xpNeeded: after.xpNeeded,
        leveledUp: after.level > before.level
    };

}

const rankStmt = db.prepare(`
    SELECT COUNT(*) + 1 AS rank
    FROM levels
    WHERE guild_id = ? AND xp > (
        SELECT COALESCE(xp, 0) FROM levels WHERE user_id = ? AND guild_id = ?
    )
`);

/**
 * Peringkat member di server ini berdasarkan XP (1 = paling tinggi).
 */
export function getRank(userId, guildId) {
    return rankStmt.get(guildId, userId, guildId).rank;
}

const leaderboardStmt = db.prepare(`
    SELECT user_id, xp
    FROM levels
    WHERE guild_id = ?
    ORDER BY xp DESC
    LIMIT ? OFFSET ?
`);

export function getLeaderboard(guildId, limit = 10, offset = 0) {
    return leaderboardStmt.all(guildId, limit, offset).map(row => ({
        userId: row.user_id,
        totalXP: row.xp,
        ...computeLevel(row.xp)
    }));
}

const countStmt = db.prepare(
    "SELECT COUNT(*) AS total FROM levels WHERE guild_id = ?"
);

/**
 * Jumlah member yang tercatat punya XP di server ini —
 * dipakai buat hitung total halaman leaderboard.
 */
export function getTrackedMemberCount(guildId) {
    return countStmt.get(guildId).total;
}

const allLevelsStmt = db.prepare(
    "SELECT user_id, xp FROM levels WHERE guild_id = ? ORDER BY xp DESC"
);

/**
 * Semua member ber-XP di server ini + level terhitungnya.
 * Dipakai operasi bulk (mis. /sync-rewards).
 */
export function getAllLevels(guildId) {
    return allLevelsStmt.all(guildId).map(row => ({
        userId: row.user_id,
        totalXP: row.xp,
        ...computeLevel(row.xp)
    }));
}
