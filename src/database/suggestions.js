import db from "./db.js";

// ===== Config (channel tujuan) =====

const getConfigStmt = db.prepare(
    "SELECT channel_id FROM suggestion_config WHERE guild_id = ?"
);

const setConfigStmt = db.prepare(`
    INSERT INTO suggestion_config (guild_id, channel_id)
    VALUES (@guildId, @channelId)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = @channelId
`);

export function getSuggestionChannel(guildId) {
    return getConfigStmt.get(guildId)?.channel_id ?? null;
}

export function setSuggestionChannel(guildId, channelId) {
    setConfigStmt.run({ guildId, channelId });
}

// ===== Suggestions =====

const nextNumberStmt = db.prepare(
    "SELECT COALESCE(MAX(number), 0) + 1 AS next FROM suggestions WHERE guild_id = ?"
);

const insertStmt = db.prepare(`
    INSERT INTO suggestions (guild_id, number, user_id, content, status, created_at)
    VALUES (@guildId, @number, @userId, @content, 'pending', @createdAt)
`);

/**
 * Buat suggestion baru (transaksi: nomor urut + insert atomik,
 * pola sama dengan createTicket/createCase). Balikin { number }.
 */
export const createSuggestion = db.transaction((guildId, userId, content) => {

    const number = nextNumberStmt.get(guildId).next;

    insertStmt.run({ guildId, number, userId, content, createdAt: Date.now() });

    return { number };

});

const attachMessageStmt = db.prepare(`
    UPDATE suggestions SET message_id = @messageId
    WHERE guild_id = @guildId AND number = @number
`);

/** Simpan referensi pesan embed-nya setelah berhasil terkirim. */
export function attachSuggestionMessage(guildId, number, messageId) {
    attachMessageStmt.run({ guildId, number, messageId });
}

const byNumberStmt = db.prepare(
    "SELECT * FROM suggestions WHERE guild_id = ? AND number = ?"
);

export function getSuggestion(guildId, number) {

    const row = byNumberStmt.get(guildId, number);
    if (!row) return null;

    return mapRow(row);

}

const decideStmt = db.prepare(`
    UPDATE suggestions SET status = @status, reviewed_by = @reviewerId, reviewed_at = @reviewedAt
    WHERE guild_id = @guildId AND number = @number AND status = 'pending'
`);

/**
 * Putuskan suggestion yang masih pending jadi 'approved' atau 'rejected'.
 * Guard WHERE status = 'pending' — anti dobel-klik dari dua staff
 * (pola sama dengan reviewCreatorApplication). Balikin true kalau berhasil.
 */
export function decideSuggestion(guildId, number, status, reviewerId) {
    return decideStmt.run({
        guildId, number, status, reviewerId, reviewedAt: Date.now()
    }).changes > 0;
}

const implementStmt = db.prepare(`
    UPDATE suggestions SET status = 'implemented', reviewed_by = @reviewerId, reviewed_at = @reviewedAt
    WHERE guild_id = @guildId AND number = @number AND status = 'approved'
`);

/**
 * Tandai suggestion yang sudah approved sebagai 'implemented'.
 * Guard WHERE status = 'approved' — cuma bisa dari status itu.
 */
export function implementSuggestion(guildId, number, reviewerId) {
    return implementStmt.run({ guildId, number, reviewerId, reviewedAt: Date.now() }).changes > 0;
}

function mapRow(row) {
    return {
        number: row.number,
        userId: row.user_id,
        content: row.content,
        messageId: row.message_id,
        status: row.status,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at
    };
}
