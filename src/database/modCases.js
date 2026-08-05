import db from "./db.js";

const nextNumberStmt = db.prepare(
    "SELECT COALESCE(MAX(case_number), 0) + 1 AS next FROM mod_cases WHERE guild_id = ?"
);

const insertStmt = db.prepare(`
    INSERT INTO mod_cases
        (guild_id, case_number, type, user_id, moderator_id, reason, duration_ms, status, created_at)
    VALUES
        (@guildId, @caseNumber, @type, @userId, @moderatorId, @reason, @durationMs, 'active', @createdAt)
`);

/**
 * Catat satu case moderasi baru (transaksi: nomor urut + insert atomik,
 * sama pola dengan createTicket di tickets.js).
 * Balikin { caseNumber }.
 */
export const createCase = db.transaction((guildId, { type, userId, moderatorId, reason, durationMs = null }) => {

    const caseNumber = nextNumberStmt.get(guildId).next;

    insertStmt.run({
        guildId,
        caseNumber,
        type,
        userId,
        moderatorId,
        reason: reason?.trim() || "No reason provided",
        durationMs,
        createdAt: Date.now()
    });

    return { caseNumber };

});

const byNumberStmt = db.prepare(
    "SELECT * FROM mod_cases WHERE guild_id = ? AND case_number = ?"
);

/** Satu case spesifik (null kalau tidak ada). Dipakai /case. */
export function getCase(guildId, caseNumber) {

    const row = byNumberStmt.get(guildId, caseNumber);
    if (!row) return null;

    return mapRow(row);

}

const activeWarningsStmt = db.prepare(`
    SELECT * FROM mod_cases
    WHERE guild_id = ? AND user_id = ? AND type = 'warn' AND status = 'active'
    ORDER BY created_at DESC
`);

/** Semua warning aktif (belum dihapus) milik satu member. */
export function getActiveWarnings(guildId, userId) {
    return activeWarningsStmt.all(guildId, userId).map(mapRow);
}

const removeWarningStmt = db.prepare(`
    UPDATE mod_cases SET status = 'removed'
    WHERE guild_id = @guildId AND case_number = @caseNumber
      AND type = 'warn' AND status = 'active'
`);

/**
 * Soft-delete satu warning by case number (histori tetap ada, cuma
 * ga lagi dihitung "aktif") — pola sama dengan closeTicket: guard
 * WHERE status = 'active' biar idempotent & anti dobel-proses.
 * Balikin true kalau ada yang ke-update.
 */
export function removeWarning(guildId, caseNumber) {
    return removeWarningStmt.run({ guildId, caseNumber }).changes > 0;
}

function mapRow(row) {
    return {
        caseNumber: row.case_number,
        type: row.type,
        userId: row.user_id,
        moderatorId: row.moderator_id,
        reason: row.reason,
        durationMs: row.duration_ms,
        status: row.status,
        createdAt: row.created_at
    };
}
