import db from "../database/db.js";

/**
 * Katalog role yang bisa dibeli pakai Shards (opsi A).
 * Admin isi lewat /shop-role-add, member beli lewat /buy.
 */

const listStmt = db.prepare(
    "SELECT item_id, role_id, name, emoji, description, price FROM shop_roles WHERE guild_id = ? ORDER BY price ASC"
);

const getStmt = db.prepare(
    "SELECT item_id, role_id, name, emoji, description, price FROM shop_roles WHERE guild_id = ? AND item_id = ?"
);

const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO shop_roles (guild_id, item_id, role_id, name, emoji, description, price)
    VALUES (@guildId, @itemId, @roleId, @name, @emoji, @description, @price)
`);

const deleteStmt = db.prepare(
    "DELETE FROM shop_roles WHERE guild_id = ? AND item_id = ?"
);

/** Semua role yang dijual di server ini. */
export function getShopRoles(guildId) {
    return listStmt.all(guildId);
}

export function getShopRole(guildId, itemId) {
    return getStmt.get(guildId, itemId) ?? null;
}

/** Tambah / update role di katalog. itemId = id unik buat beli. */
export function addShopRole(guildId, itemId, roleId, name, emoji, description, price) {
    insertStmt.run({ guildId, itemId, roleId, name, emoji, description, price });
}

export function removeShopRole(guildId, itemId) {
    return deleteStmt.run(guildId, itemId).changes > 0;
}
