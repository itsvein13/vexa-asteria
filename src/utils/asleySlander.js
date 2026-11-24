import { AI_CONFIG } from "../config/ai.config.js";

/**
 * Sindiran buat orang-orang yang "dikenal" Vexa — dipicu pas dia
 * kirim pesan (mention atau nggak), di channel mana aja.
 *
 * Jatah: maksimal `roastMaxPerWeek` kali per `roastWindowMs`.
 * Teks diambil acak dari `lines` biar nggak template banget.
 *
 * Hitungan baru dicatat SETELAH pesan berhasil terkirim, biar kirim
 * gagal (bot nggak punya izin) nggak makan giliran.
 *
 * Roast terakhir disimpen sementara buat AI: kalau korban nanyain Vexa
 * dalam `roastContextMs`, AI tau barusan ngomong apa.
 */

// userId -> array timestamp kapan dia di-roast
const hits = new Map();

// userId -> { line, at } roast terakhir
const lastRoast = new Map();

function findTarget(userId) {

    const id = String(userId ?? "");

    return AI_CONFIG.roastTargets?.find(t => String(t.userId) === id) ?? null;

}

/** Cari konfigurasi target dari userId. */
export function getRoastTarget(userId) {
    return findTarget(userId);
}

/** Roster target (buat owner command). */
export function getRoastTargets() {
    return AI_CONFIG.roastTargets ?? [];
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
    const max = AI_CONFIG.roastMaxPerWeek ?? 2;

    const stamps = (hits.get(String(userId)) ?? []).filter(ts => now - ts < window);

    if (stamps.length >= max) {
        return null;
    }

    return target;

}

/**
 * Catat bahwa user udah dikejek — panggil hanya kalau kirim sukses.
 * Simpen juga teksnya buat konteks AI.
 */
export function markRoast(userId, line, now = Date.now()) {

    const key = String(userId);

    const stamps = (hits.get(key) ?? []).filter(ts => now - ts < AI_CONFIG.roastWindowMs);
    stamps.push(now);
    hits.set(key, stamps);

    lastRoast.set(key, { line, at: now });

}

/** Reset jadwal (testing / admin). */
export function resetRoast(userId) {
    if (userId === undefined) {
        hits.clear();
        lastRoast.clear();
    } else {
        hits.delete(String(userId));
        lastRoast.delete(String(userId));
    }
}

/**
 * Pilih satu teks sindiran dari target. Acak, tapi stabil per
 * pesan kalau dikasih seed (biar nggak "kedip" kalau dipanggil 2x).
 */
export function roastLine(target, seed = Date.now()) {

    const lines = Array.isArray(target?.lines) && target.lines.length
        ? target.lines
        : [target?.text ?? ""].filter(Boolean);

    const index = Math.abs(Number(seed) || 0) % lines.length;

    return lines[index];

}

/**
 * Ambil konteks roast terakhir buat user ini — kalau masih dalam
 * `roastContextMs`. Dipakai AI biar nyambung sama roasting.
 * @returns {{ line: string, ageMinutes: number }|null}
 */
export function getRoastContext(userId, now = Date.now()) {

    const ctx = lastRoast.get(String(userId));

    if (!ctx) return null;

    const ttl = AI_CONFIG.roastContextMs ?? 15 * 60 * 1000;

    if (now - ctx.at > ttl) return null;

    return { line: ctx.line, ageMinutes: Math.round((now - ctx.at) / 60000) };

}

/** Backward-compat: nama lama biar import lama nggak error. */
export const shouldRoastAsley = shouldRoast;
export const markRoastAsley = markRoast;
