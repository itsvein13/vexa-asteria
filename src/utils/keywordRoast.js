import { AI_CONFIG } from "../config/ai.config.js";

/**
 * Trigger kata kunci universal — siapa aja ngetik "apaa"/"apaan" dll,
 * dibalas langsung (nggak nunggu jadwal roast).
 *
 * Cooldown global per user biar nggak numpuk.
 */

const cooldowns = new Map();

/**
 * Cek apakah pesan ini kena keyword. Balikin { line } atau null.
 */
export function matchKeywordRoast(message, now = Date.now()) {

    const cfg = AI_CONFIG.keywordRoasts;

    if (!cfg) return null;

    const text = String(message?.content ?? "").toLowerCase();

    const hit = (cfg.keywords ?? []).some(kw => text.includes(String(kw).toLowerCase()));

    if (!hit) return null;

    const cooldown = cfg.cooldownMs ?? 30 * 1000;
    const key = String(message?.author?.id ?? "dm");
    const last = cooldowns.get(key) ?? 0;

    if (now - last < cooldown) return null;

    cooldowns.set(key, now);

    const lines = cfg.lines ?? [];
    const line = lines.length ? lines[Math.floor(Math.random() * lines.length)] : "";

    return { line };

}

/** Reset cooldown (testing). */
export function resetKeywordRoast(userId) {
    if (userId === undefined) cooldowns.clear();
    else cooldowns.delete(String(userId));
}
