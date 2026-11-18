import db from "../database/db.js";

// Ambil member yang "aktif" — punya XP tercatat (pernah ngirim pesan
// sejak leveling aktif). Diurut dari XP tertinggi.
const activeStmt = db.prepare(`
    SELECT user_id, xp
    FROM levels
    WHERE guild_id = ? AND xp > 0
    ORDER BY xp DESC
`);

/**
 * Ambil member aktif buat giveaway. Kalau yang aktif kurang dari
 * max, ya segitu — jangan dipaksa.
 */
export function getActiveMembers(guildId, max = 50) {
    return activeStmt.all(guildId).slice(0, max);
}
