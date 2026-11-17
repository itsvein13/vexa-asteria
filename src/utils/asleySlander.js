import { AI_CONFIG } from "../config/ai.config.js";

/**
 * Sindiran buat Bang Asley — maksimal 1x per 2 hari, dipicu pas
 * dia kirim pesan (mention atau nggak), di channel mana aja.
 *
 * Hitungan baru dicatat SETELAH pesan berhasil terkirim, biar kirim
 * gagal (bot nggak punya izin) nggak makan giliran 2 hari.
 */

const hits = new Map();

export function isAsley(userId) {
    return String(userId ?? "") === AI_CONFIG.asley.userId;
}

/**
 * Cek apakah Asley boleh dikejek sekarang. TANPA mencatat —
 * pemanggil harus panggil markRoastAsley() kalau kirim sukses.
 */
export function shouldRoastAsley(userId, now = Date.now()) {

    if (!isAsley(userId)) return false;

    const window = AI_CONFIG.asley.windowMs;
    const last = hits.get(String(userId)) ?? 0;

    return now - last >= window;

}

/** Catat bahwa Asley udah dikejek — panggil hanya kalau kirim sukses. */
export function markRoastAsley(userId, now = Date.now()) {
    hits.set(String(userId), now);
}

