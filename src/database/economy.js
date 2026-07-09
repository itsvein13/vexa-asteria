import db from "./db.js";

const getBalanceStmt = db.prepare(
    "SELECT balance FROM economy WHERE user_id = ? AND guild_id = ?"
);

const addStmt = db.prepare(`
    INSERT INTO economy (user_id, guild_id, balance)
    VALUES (@userId, @guildId, @amount)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET balance = balance + @amount
`);

// UPDATE bersyarat: cuma jalan kalau saldo cukup → atomik,
// ga ada window antara "cek saldo" dan "potong saldo".
const spendStmt = db.prepare(`
    UPDATE economy
    SET balance = balance - @cost
    WHERE user_id = @userId AND guild_id = @guildId AND balance >= @cost
`);

const ownStmt = db.prepare(
    "SELECT 1 FROM inventory WHERE user_id = ? AND guild_id = ? AND item_id = ?"
);

const grantItemStmt = db.prepare(`
    INSERT OR IGNORE INTO inventory (user_id, guild_id, item_id, acquired_at)
    VALUES (@userId, @guildId, @itemId, @acquiredAt)
`);

const inventoryStmt = db.prepare(
    "SELECT item_id, acquired_at FROM inventory WHERE user_id = ? AND guild_id = ?"
);

export function getBalance(userId, guildId) {
    return getBalanceStmt.get(userId, guildId)?.balance ?? 0;
}

/** Tambah Shards (daily, level-up, admin). Balikin saldo baru. */
export function addShards(userId, guildId, amount) {
    addStmt.run({ userId, guildId, amount });
    return getBalance(userId, guildId);
}

export function ownsItem(userId, guildId, itemId) {
    return ownStmt.get(userId, guildId, itemId) !== undefined;
}

export function getInventory(userId, guildId) {
    return inventoryStmt.all(userId, guildId).map(r => r.item_id);
}

/**
 * Beli item: potong saldo + tambahkan ke inventory dalam SATU transaksi.
 * Balikin:
 * - { ok: true, balance }            → sukses
 * - { ok: false, reason: "owned" }   → sudah punya
 * - { ok: false, reason: "balance", balance } → saldo kurang
 */
export const purchaseItem = db.transaction((userId, guildId, itemId, cost) => {

    if (ownsItem(userId, guildId, itemId)) {
        return { ok: false, reason: "owned" };
    }

    const result = spendStmt.run({ userId, guildId, cost });

    if (result.changes === 0) {
        return { ok: false, reason: "balance", balance: getBalance(userId, guildId) };
    }

    grantItemStmt.run({ userId, guildId, itemId, acquiredAt: Date.now() });

    return { ok: true, balance: getBalance(userId, guildId) };

});
