const UNIT_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
};

// Batas timeout native Discord: 28 hari.
export const MAX_TIMEOUT_MS = 28 * UNIT_MS.d;

/**
 * Parse durasi singkat ("10m", "1h", "7d", "2w") jadi milidetik.
 * Balikin null kalau formatnya invalid, nol/negatif, atau melebihi
 * batas timeout Discord (28 hari) — caller yang tampilkan pesan errornya.
 */
export function parseDuration(input) {

    const match = /^(\d+)\s*(s|m|h|d|w)$/i.exec(input?.trim() ?? "");
    if (!match) return null;

    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const ms = amount * UNIT_MS[unit];

    if (ms <= 0 || ms > MAX_TIMEOUT_MS) return null;

    return ms;

}

/** Format milidetik jadi string ringkas ("1h", "3d") buat ditampilkan di embed. */
export function formatDuration(ms) {

    if (!ms) return "-";

    const units = [["w", UNIT_MS.w], ["d", UNIT_MS.d], ["h", UNIT_MS.h], ["m", UNIT_MS.m], ["s", UNIT_MS.s]];

    for (const [unit, unitMs] of units) {
        if (ms >= unitMs && ms % unitMs === 0) return `${ms / unitMs}${unit}`;
    }

    return `${Math.round(ms / UNIT_MS.m)}m`;

}
