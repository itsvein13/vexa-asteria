// Rate limit in-memory per Discord user. Reset saat bot restart.
// Ini pengaman biar kuota Gemini gratis nggak habis.

import { AI_CONFIG } from "../config/ai.config.js";

const buckets = new Map();

export function checkAiRateLimit(userId, { limit, windowMs } = {}) {

    const max = Number.isInteger(limit) && limit > 0 ? limit : 5;
    const window = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 10 * 60 * 1000;

    const key = String(userId);
    const now = Date.now();

    // Owner bebas dari rate limit.
    if (key === String(AI_CONFIG.limits.ownerUserId)) {
        return { allowed: true, retryAfterMs: 0, remaining: Number.MAX_SAFE_INTEGER };
    }

    const hits = (buckets.get(key) ?? []).filter(ts => now - ts < window);

    if (hits.length >= max) {
        buckets.set(key, hits);
        return {
            allowed: false,
            retryAfterMs: Math.max(window - (now - hits[0]), 0),
            remaining: 0
        };
    }

    hits.push(now);
    buckets.set(key, hits);

    return { allowed: true, retryAfterMs: 0, remaining: max - hits.length };
}

export function resetAiRateLimit(userId) {
    if (userId === undefined) buckets.clear();
    else buckets.delete(String(userId));
}
