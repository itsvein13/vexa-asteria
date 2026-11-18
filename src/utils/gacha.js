import { getShopBadges, ownsBadge, grantBadge } from "../database/shopBadges.js";

/**
 * Gacha / lootbox: bayar Shards, dapet badge acak.
 * Drop rate per badge diset di shop_badges.badge_id berbentuk
 * "id:weight" kalau mau dibedakan — untuk sekarang semua rata.
 */

/**
 * Undi satu badge acak dari katalog server.
 * @returns {object|null} badge yang keluar
 */
export function rollGacha(guildId, rng = Math.random) {

    const badges = getShopBadges(guildId);

    if (badges.length === 0) return null;

    const i = Math.floor(rng() * badges.length);

    return badges[i];

}

/**
 * Cek apakah user bisa dapet badge duplikat (buat info aja).
 */
export function isDuplicate(userId, guildId, badge) {
    return ownsBadge(userId, guildId, badge.item_id);
}

/** Kasih badge ke user (sudah dicek saldo oleh caller). */
export function awardBadge(userId, guildId, badge) {
    grantBadge(userId, guildId, badge.item_id);
}
