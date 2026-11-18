import db from "../database/db.js";

/**
 * Badge yang bisa dibeli / didapat dari gacha, dan satu badge aktif
 * yang ditampilkan di profile card.
 */

const listStmt = db.prepare(
    "SELECT item_id, name, emoji, description, price FROM shop_badges WHERE guild_id = ? ORDER BY price ASC"
);

const getStmt = db.prepare(
    "SELECT item_id, name, emoji, description, price FROM shop_badges WHERE guild_id = ? AND item_id = ?"
);

const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO shop_badges (guild_id, item_id, name, emoji, description, price)
    VALUES (@guildId, @itemId, @name, @emoji, @description, @price)
`);

const deleteStmt = db.prepare(
    "DELETE FROM shop_badges WHERE guild_id = ? AND item_id = ?"
);

const ownedStmt = db.prepare(
    "SELECT item_id, acquired_at FROM owned_badges WHERE user_id = ? AND guild_id = ? ORDER BY acquired_at ASC"
);

const hasStmt = db.prepare(
    "SELECT 1 FROM owned_badges WHERE user_id = ? AND guild_id = ? AND item_id = ?"
);

const grantStmt = db.prepare(`
    INSERT OR IGNORE INTO owned_badges (user_id, guild_id, item_id, acquired_at)
    VALUES (@userId, @guildId, @itemId, @acquiredAt)
`);

const activeStmt = db.prepare(
    "SELECT badge_id FROM active_badge WHERE user_id = ? AND guild_id = ?"
);

const setActiveStmt = db.prepare(`
    INSERT INTO active_badge (user_id, guild_id, badge_id)
    VALUES (@userId, @guildId, @badgeId)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET badge_id = @badgeId
`);

export function getShopBadges(guildId) {
    return listStmt.all(guildId);
}

export function getShopBadge(guildId, itemId) {
    return getStmt.get(guildId, itemId) ?? null;
}

export function addShopBadge(guildId, itemId, name, emoji, description, price) {
    insertStmt.run({ guildId, itemId, name, emoji, description, price });
}

export function removeShopBadge(guildId, itemId) {
    return deleteStmt.run(guildId, itemId).changes > 0;
}

export function getOwnedBadges(userId, guildId) {
    return ownedStmt.all(userId, guildId);
}

export function ownsBadge(userId, guildId, itemId) {
    return hasStmt.get(userId, guildId, itemId) !== undefined;
}

export function grantBadge(userId, guildId, itemId) {
    grantStmt.run({ userId, guildId, itemId, acquiredAt: Date.now() });
}

export function getActiveBadge(userId, guildId) {
    const id = activeStmt.get(userId, guildId)?.badge_id ?? null;
    if (!id) return null;
    return getShopBadge(guildId, id) ?? getOwnedBadges(userId, guildId).find(b => b.item_id === id) ?? null;
}

export function setActiveBadge(userId, guildId, badgeId) {
    setActiveStmt.run({ userId, guildId, badgeId });
}
