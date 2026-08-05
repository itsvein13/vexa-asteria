import db from "./db.js";

// ===== Config (channel review) =====

const getConfigStmt = db.prepare(
    "SELECT channel_id FROM creator_review_config WHERE guild_id = ?"
);

const setConfigStmt = db.prepare(`
    INSERT INTO creator_review_config (guild_id, channel_id)
    VALUES (@guildId, @channelId)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = @channelId
`);

export function getCreatorReviewChannel(guildId) {
    return getConfigStmt.get(guildId)?.channel_id ?? null;
}

export function setCreatorReviewChannel(guildId, channelId) {
    setConfigStmt.run({ guildId, channelId });
}

// ===== Applications =====

const getStmt = db.prepare(
    "SELECT link, status, submitted_at, reviewed_by, reviewed_at FROM creator_applications WHERE guild_id = ? AND user_id = ?"
);

// Upsert = submit baru ATAU re-apply setelah reject; status selalu
// balik ke pending dan jejak review lama dibersihkan.
const submitStmt = db.prepare(`
    INSERT INTO creator_applications (guild_id, user_id, link, status, submitted_at, reviewed_by, reviewed_at)
    VALUES (@guildId, @userId, @link, 'pending', @submittedAt, NULL, NULL)
    ON CONFLICT(guild_id, user_id)
    DO UPDATE SET link = @link, status = 'pending', submitted_at = @submittedAt,
                  reviewed_by = NULL, reviewed_at = NULL
`);

const reviewStmt = db.prepare(`
    UPDATE creator_applications
    SET status = @status, reviewed_by = @reviewedBy, reviewed_at = @reviewedAt
    WHERE guild_id = @guildId AND user_id = @userId AND status = 'pending'
`);

export function getCreatorApplication(guildId, userId) {

    const row = getStmt.get(guildId, userId);
    if (!row) return null;

    return {
        link: row.link,
        status: row.status,
        submittedAt: row.submitted_at,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at
    };

}

export function submitCreatorApplication(guildId, userId, link) {
    submitStmt.run({ guildId, userId, link, submittedAt: Date.now() });
}

/**
 * Set keputusan review (approved/rejected). Cuma berhasil kalau
 * aplikasinya masih 'pending' — mencegah dua staff klik Approve/Reject
 * bersamaan dari saling menimpa keputusan satu sama lain.
 * Balikin true kalau berhasil, false kalau sudah diputuskan duluan.
 */
export function reviewCreatorApplication(guildId, userId, status, reviewedBy) {
    return reviewStmt.run({
        guildId, userId, status, reviewedBy, reviewedAt: Date.now()
    }).changes > 0;
}
