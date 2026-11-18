import { AI_CONFIG } from "../config/ai.config.js";

/**
 * Trigger kata kunci — Billson ngetik "apaa"/"apaan" dll, Vexa
 * bales langsung (nggak nunggu jadwal roast mingguan).
 *
 * Cooldown per user biar nggak numpuk kalau dia ngetik beruntun.
 */

const cooldowns = new Map();

function findKeywordTarget(userId) {

    const id = String(userId ?? "");

    return AI_CONFIG.keywordRoasts?.find(t => String(t.userId) === id) ?? null;

}

/**
 * Cek apakah pesan ini cocok dengan keyword target, dan cooldown-nya
 * udah lewat. Balikin { target, line } atau null.
 */
export function matchKeywordRoast(message, now = Date.now()) {

    const target = findKeywordTarget(message?.author?.id);

    if (!target) return null;

    const text = String(message?.content ?? "").toLowerCase();

    const hit = target.keywords.some(kw => text.includes(String(kw).toLowerCase()));

    if (!hit) return null;

    const cooldown = AI_CONFIG.keywordRoastCooldownMs ?? 30 * 1000;
    const last = cooldowns.get(String(message.author.id)) ?? 0;

    if (now - last < cooldown) return null;

    cooldowns.set(String(message.author.id), now);

    const index = Math.floor(Math.random() * target.lines.length);

    return { target, line: target.lines[index] };

}

/** Reset cooldown (testing). */
export function resetKeywordRoast(userId) {
    if (userId === undefined) cooldowns.clear();
    else cooldowns.delete(String(userId));
}
