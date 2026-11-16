import { AI_CONFIG } from "../config/ai.config.js";

/**
 * Sindiran buat Bang Asley — maksimal 1x per 7 hari, dipicu pas
 * dia kirim pesan (mention atau nggak).
 */

const hits = new Map();

const LOG_KEY = "568255840797065235";

export function isAsley(userId) {
    return String(userId ?? "") === AI_CONFIG.asley.userId;
}

/**
 * Cek apakah Asley boleh dikejek sekarang. Kalau boleh, hit-nya
 * dicatat. Kalau nggak, false.
 */
export function shouldRoastAsley(userId, now = Date.now()) {

    if (!isAsley(userId)) return false;

    const window = AI_CONFIG.asley.windowMs;
    const last = hits.get(LOG_KEY) ?? 0;

    if (now - last < window) return false;

    hits.set(LOG_KEY, now);

    return true;
}

/** Pilih kalimat sindiran. Varian biar nggak monoton. */
export function asleyLine(seed = 0) {

    const lines = AI_CONFIG.asley.lines;
    const index = Math.abs(Number(seed) || 0) % lines.length;

    return lines[index];
}
