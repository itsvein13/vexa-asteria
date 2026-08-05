import db from "./db.js";

const upsertJoinStmt = db.prepare(`
    INSERT INTO invite_uses (guild_id, invited_user_id, inviter_id, invite_code, joined_at, left_at)
    VALUES (@guildId, @invitedUserId, @inviterId, @inviteCode, @joinedAt, NULL)
    ON CONFLICT(guild_id, invited_user_id)
    DO UPDATE SET inviter_id = @inviterId, invite_code = @inviteCode,
                  joined_at = @joinedAt, left_at = NULL
`);

/**
 * Catat member baru join lewat invite tertentu. Upsert — kalau member
 * ini pernah tercatat sebelumnya (mis. keluar-masuk lagi), datanya
 * di-refresh dan left_at direset ke NULL (invite-nya aktif lagi).
 * inviterId bisa null kalau invite-nya ga berhasil diidentifikasi
 * (mis. vanity URL atau widget invite).
 */
export function recordJoin(guildId, invitedUserId, inviterId, inviteCode) {
    upsertJoinStmt.run({
        guildId, invitedUserId, inviterId, inviteCode, joinedAt: Date.now()
    });
}

const markLeftStmt = db.prepare(`
    UPDATE invite_uses SET left_at = @leftAt
    WHERE guild_id = @guildId AND invited_user_id = @invitedUserId AND left_at IS NULL
`);

/**
 * Tandai member keluar server — invite yang membawanya ga lagi dihitung
 * "aktif" buat si inviter (anti-cheat: invite lalu langsung leave ga
 * ngasih kredit permanen). Kalau dia join lagi nanti, recordJoin akan
 * reset left_at balik ke NULL.
 */
export function recordLeave(guildId, userId) {
    markLeftStmt.run({ guildId, invitedUserId: userId, leftAt: Date.now() });
}

const statsStmt = db.prepare(`
    SELECT
        COUNT(*) AS totalJoins,
        SUM(CASE WHEN left_at IS NULL THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN left_at IS NOT NULL THEN 1 ELSE 0 END) AS left_
    FROM invite_uses
    WHERE guild_id = ? AND inviter_id = ?
`);

/** Statistik invite satu inviter: { active, totalJoins, left }. */
export function getInviteStats(guildId, inviterId) {

    const row = statsStmt.get(guildId, inviterId);

    return {
        active: row?.active ?? 0,
        totalJoins: row?.totalJoins ?? 0,
        left: row?.left_ ?? 0
    };

}

const leaderboardStmt = db.prepare(`
    SELECT inviter_id AS inviterId, COUNT(*) AS active
    FROM invite_uses
    WHERE guild_id = ? AND left_at IS NULL AND inviter_id IS NOT NULL
    GROUP BY inviter_id
    ORDER BY active DESC
    LIMIT ?
`);

/** Top inviter berdasarkan invite yang masih aktif (belum leave). */
export function getInviteLeaderboard(guildId, limit = 10) {
    return leaderboardStmt.all(guildId, limit);
}

const allInvitersStmt = db.prepare(`
    SELECT inviter_id AS inviterId, COUNT(*) AS active
    FROM invite_uses
    WHERE guild_id = ? AND left_at IS NULL AND inviter_id IS NOT NULL
    GROUP BY inviter_id
`);

/**
 * SEMUA inviter dengan invite aktif (tanpa LIMIT) — beda dari
 * getInviteLeaderboard yang dipotong buat tampilan. Dipakai
 * /referral-sync buat re-cek milestone semua orang, bukan cuma top 10.
 */
export function getAllInviterCounts(guildId) {
    return allInvitersStmt.all(guildId);
}
