import db from "./db.js";

// Harga disimpan sebagai TEXT (bukan INTEGER) sengaja — biar admin bebas
// nulis "Mulai Rp150.000", "Nego", "$25+", dsb, bukan dipaksa angka polos.

const setStmt = db.prepare(`
    INSERT INTO service_pricing (guild_id, category_id, price, note, updated_at)
    VALUES (@guildId, @categoryId, @price, @note, @updatedAt)
    ON CONFLICT(guild_id, category_id)
    DO UPDATE SET price = @price, note = @note, updated_at = @updatedAt
`);

export function setServicePrice(guildId, categoryId, price, note = null) {
    setStmt.run({ guildId, categoryId, price, note, updatedAt: Date.now() });
}

const removeStmt = db.prepare(
    "DELETE FROM service_pricing WHERE guild_id = ? AND category_id = ?"
);

/** Hapus harga satu kategori. Return true kalau memang ada yang dihapus. */
export function removeServicePrice(guildId, categoryId) {
    return removeStmt.run(guildId, categoryId).changes > 0;
}

const getOneStmt = db.prepare(
    "SELECT price, note FROM service_pricing WHERE guild_id = ? AND category_id = ?"
);

export function getServicePrice(guildId, categoryId) {
    return getOneStmt.get(guildId, categoryId) ?? null;
}

const getAllStmt = db.prepare(
    "SELECT category_id, price, note FROM service_pricing WHERE guild_id = ?"
);

/** Map category_id -> { price, note } buat guild ini. */
export function getAllServicePrices(guildId) {
    return getAllStmt.all(guildId).reduce((map, row) => {
        map[row.category_id] = { price: row.price, note: row.note };
        return map;
    }, {});
}
