import db from "./db.js";

// ===== Config (channel tujuan) =====

const getConfigStmt = db.prepare(
    "SELECT channel_id FROM testimonial_config WHERE guild_id = ?"
);

const setConfigStmt = db.prepare(`
    INSERT INTO testimonial_config (guild_id, channel_id)
    VALUES (@guildId, @channelId)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = @channelId
`);

export function getTestimonialChannel(guildId) {
    return getConfigStmt.get(guildId)?.channel_id ?? null;
}

export function setTestimonialChannel(guildId, channelId) {
    setConfigStmt.run({ guildId, channelId });
}

// ===== Testimonials =====

const existsStmt = db.prepare(
    "SELECT 1 FROM testimonials WHERE guild_id = ? AND ticket_number = ?"
);

/** Sudah pernah ada review buat tiket ini? (cegah DM minta review dobel) */
export function hasTestimonial(guildId, ticketNumber) {
    return Boolean(existsStmt.get(guildId, ticketNumber));
}

const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO testimonials
        (guild_id, ticket_number, user_id, category, rating, content, created_at)
    VALUES
        (@guildId, @ticketNumber, @userId, @category, @rating, @content, @createdAt)
`);

/**
 * Simpan review satu tiket. INSERT OR IGNORE + PRIMARY KEY (guild_id,
 * ticket_number) — kalau dua submit modal kebetulan bersamaan (mis.
 * user klik ganda), cuma yang pertama yang kesimpen. Balikin true
 * kalau berhasil kesimpen, false kalau ternyata sudah ada duluan.
 */
export function saveTestimonial(guildId, ticketNumber, userId, category, rating, content) {
    return insertStmt.run({
        guildId, ticketNumber, userId, category, rating,
        content: content || null,
        createdAt: Date.now()
    }).changes > 0;
}

const leaderboardStmt = db.prepare(`
    SELECT ROUND(AVG(rating), 2) AS avgRating, COUNT(*) AS total
    FROM testimonials
    WHERE guild_id = ?
`);

/** Rata-rata rating & total review server ini — dipakai /stats kalau mau. */
export function getTestimonialSummary(guildId) {
    const row = leaderboardStmt.get(guildId);
    return { avgRating: row?.avgRating ?? null, total: row?.total ?? 0 };
}
