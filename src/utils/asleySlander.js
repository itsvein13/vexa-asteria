import { AI_CONFIG } from "../config/ai.config.js";

/**
 * Sindiran buat orang-orang yang "dikenal" Vexa — dipicu pas dia
 * kirim pesan (mention atau nggak), di channel mana aja.
 *
 * Tiap target punya jatah sendiri per roastWindowMs. Hitungan baru
 * dicatat SETELAH pesan berhasil terkirim, biar kirim gagal (bot
 * nggak punya izin) nggak makan giliran.
 */

const hits = new Map();

function findTarget(userId) {

    const id = String(userId ?? "");

    return AI_CONFIG.roastTargets?.find(t => String(t.userId) === id) ?? null;

}

/** Cari konfigurasi target dari userId. */
export function getRoastTarget(userId) {
    return findTarget(userId);
}

/**
 * Cek apakah user ini boleh dikejek sekarang. TANPA mencatat —
 * pemanggil harus panggil markRoast() kalau kirim sukses.
 * @returns {object|null} konfigurasi target kalau boleh, null kalau nggak.
 */
export function shouldRoast(userId, now = Date.now()) {

    const target = findTarget(userId);

    if (!target) return null;

    const window = AI_CONFIG.roastWindowMs;
    const last = hits.get(String(userId)) ?? 0;

    if (now - last < window) return null;

    return target;

}

/** Catat bahwa user udah dikejek — panggil hanya kalau kirim sukses. */
export function markRoast(userId, now = Date.now()) {
    hits.set(String(userId), now);
}

/** Backward-compat: nama lama biar import lama nggak error. */
export const shouldRoastAsley = shouldRoast;
export const markRoastAsley = markRoast;
