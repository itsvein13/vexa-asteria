import db from "./db.js";

// ===== Config =====

const getConfigStmt = db.prepare(
    "SELECT staff_role_id, category_id, log_channel_id FROM ticket_config WHERE guild_id = ?"
);

const setConfigStmt = db.prepare(`
    INSERT INTO ticket_config (guild_id, staff_role_id, category_id, log_channel_id)
    VALUES (@guildId, @staffRoleId, @categoryId, @logChannelId)
    ON CONFLICT(guild_id)
    DO UPDATE SET staff_role_id = @staffRoleId, category_id = @categoryId,
                  log_channel_id = @logChannelId
`);

export function getTicketConfig(guildId) {

    const row = getConfigStmt.get(guildId);
    if (!row) return null;

    return {
        staffRoleId: row.staff_role_id,
        categoryId: row.category_id,
        logChannelId: row.log_channel_id
    };

}

export function setTicketConfig(guildId, { staffRoleId, categoryId, logChannelId }) {
    setConfigStmt.run({ guildId, staffRoleId, categoryId, logChannelId });
}

// ===== Tickets =====

const nextNumberStmt = db.prepare(
    "SELECT COALESCE(MAX(number), 0) + 1 AS next FROM tickets WHERE guild_id = ?"
);

const insertStmt = db.prepare(`
    INSERT INTO tickets (guild_id, number, user_id, channel_id, category, status, created_at)
    VALUES (@guildId, @number, @userId, @channelId, @category, 'open', @createdAt)
`);

const openByUserStmt = db.prepare(`
    SELECT number, channel_id FROM tickets
    WHERE guild_id = ? AND user_id = ? AND status = 'open'
`);

const byChannelStmt = db.prepare(`
    SELECT number, user_id, category, order_status, created_at FROM tickets
    WHERE guild_id = ? AND channel_id = ? AND status = 'open'
`);

const byNumberStmt = db.prepare(`
    SELECT number, user_id, category, order_status, created_at FROM tickets
    WHERE guild_id = ? AND number = ?
`);

const closeStmt = db.prepare(`
    UPDATE tickets SET status = 'closed', closed_at = @closedAt, closed_by = @closedBy
    WHERE guild_id = @guildId AND channel_id = @channelId AND status = 'open'
`);

const setOrderStatusStmt = db.prepare(`
    UPDATE tickets SET order_status = @orderStatus
    WHERE guild_id = @guildId AND channel_id = @channelId AND status = 'open'
`);

/**
 * Buat tiket baru (transaksi: nomor urut + insert atomik).
 * category = id dari config/ticketCategories.js (boleh null buat
 * kompatibilitas kalau ada caller lama). Balikin { number }.
 */
export const createTicket = db.transaction((guildId, userId, channelId, category = null) => {

    const number = nextNumberStmt.get(guildId).next;

    insertStmt.run({
        guildId,
        number,
        userId,
        channelId,
        category,
        createdAt: Date.now()
    });

    return { number };

});

/** Tiket yang masih open milik user ini (null kalau tidak ada). */
export function getOpenTicket(guildId, userId) {
    const row = openByUserStmt.get(guildId, userId);
    return row ? { number: row.number, channelId: row.channel_id } : null;
}

/** Data tiket open berdasarkan channel-nya (null kalau bukan channel tiket). */
export function getTicketByChannel(guildId, channelId) {
    const row = byChannelStmt.get(guildId, channelId);
    return row ? mapTicketRow(row) : null;
}

/** Tandai tiket closed. Balikin true kalau ada yang ter-update. */
export function closeTicket(guildId, channelId, closedBy) {
    return closeStmt.run({ guildId, channelId, closedBy, closedAt: Date.now() }).changes > 0;
}

/**
 * Data tiket berdasarkan nomor urutnya — beda dari getTicketByChannel,
 * ini ga syarat status 'open' dan ga butuh channel-nya masih ada.
 * Dipakai testimonial system karena channel tiket udah kehapus
 * waktu member ngisi review-nya.
 */
export function getTicketByNumber(guildId, number) {
    const row = byNumberStmt.get(guildId, number);
    return row ? mapTicketRow(row) : null;
}

/**
 * Update status progres (bukan status buka/tutup) tiket ini — dipakai
 * /ticket-status. Cuma bisa dipakai selagi tiketnya masih open. Kirim
 * orderStatus = null buat reset. Balikin true kalau ada yang ke-update.
 */
export function setOrderStatus(guildId, channelId, orderStatus) {
    return setOrderStatusStmt.run({ guildId, channelId, orderStatus }).changes > 0;
}

function mapTicketRow(row) {
    return {
        number: row.number,
        userId: row.user_id,
        category: row.category,
        orderStatus: row.order_status,
        createdAt: row.created_at
    };
}
