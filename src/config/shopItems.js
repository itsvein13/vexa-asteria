import THEMES from "./themes.js";

/**
 * Katalog shop. Menambah barang = menambah entry di sini.
 * type "theme" → item_id harus cocok dengan key di themes.js.
 */
const SHOP_ITEMS = [

    {
        id: "crimson",
        type: "theme",
        name: THEMES.crimson.name,
        emoji: THEMES.crimson.emoji,
        description: "Palet pink-merah menyala untuk profile card kamu.",
        price: 1500
    },

    {
        id: "emerald",
        type: "theme",
        name: THEMES.emerald.name,
        emoji: THEMES.emerald.emoji,
        description: "Hijau zamrud yang kalem tapi mencolok.",
        price: 1500
    },

    {
        id: "golden",
        type: "theme",
        name: THEMES.golden.name,
        emoji: THEMES.golden.emoji,
        description: "Emas legendaris — flex maksimal.",
        price: 3000
    }

];

export function getShopItem(itemId) {
    return SHOP_ITEMS.find(item => item.id === itemId) ?? null;
}

export default SHOP_ITEMS;
