import db from "./db.js";

const getBalanceStmt = db.prepare(
    "SELECT balance FROM economy WHERE user_id = ? AND guild_id = ?"
);

const isUnlimitedStmt = db.prepare(
    "SELECT unlimited FROM economy WHERE user_id = ? AND guild_id = ?"
);

// Flag unlimited dicatat bareng baris economy user. Kalau barisnya
// belum ada, bikin dulu (balance 0) supaya ALTER TABLE di db.js
// ngeliat kolomnya.
const unlimitedStmt = db.prepare(`
    INSERT INTO economy (user_id, guild_id, balance, unlimited)
    VALUES (@userId, @guildId, 0, @unlimited)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET unlimited = @unlimited
`);

const addStmt = db.prepare(`
    INSERT INTO economy (user_id, guild_id, balance)
    VALUES (@userId, @guildId, @amount)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET balance = balance + @amount
`);

// Potong saldo → atomik, ga ada window antara "cek saldo" dan
// "potong saldo". User unlimited tetep bisa beli walau saldonya
// kurang (flag di kolom economy.unlimited).
const spendStmt = db.prepare(`
    UPDATE economy
    SET balance = balance - @cost
    WHERE user_id = @userId AND guild_id = @guildId
      AND (balance >= @cost OR unlimited = 1)
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

/** Cek apakah user ini punya saldo unlimited (owner). */
export function isUnlimited(userId, guildId) {
    return isUnlimitedStmt.get(userId, guildId)?.unlimited === 1;
}

/** Tambah Shards (daily, level-up, admin). Balikin saldo baru. */
export function addShards(userId, guildId, amount) {
    addStmt.run({ userId, guildId, amount });
    return getBalance(userId, guildId);
}

/**
 * Set/buka flag unlimited buat user ini. Hanya owner yang boleh.
 */
export function setUnlimited(userId, guildId, on) {
    unlimitedStmt.run({ userId, guildId, unlimited: on ? 1 : 0 });
    return isUnlimited(userId, guildId);
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

/**
 * Potong saldo aja (buat gacha / layanan yang nggak butuh item).
 * User unlimited tetep bisa walau saldo kurang.
 * Balikin { ok, balance }.
 */
export function spendShards(userId, guildId, amount) {

    const result = spendStmt.run({ userId, guildId, cost: amount });

    if (result.changes === 0) {
        return { ok: false, balance: getBalance(userId, guildId) };
    }

    return { ok: true, balance: getBalance(userId, guildId) };

}
