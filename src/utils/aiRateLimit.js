// Kuota per user, dibedakan per channel:
// - #vexa-ai  → 5 pesan per 24 jam
// - lainnya   → 2 pesan per 24 jam
// Owner bebas.

import { AI_CONFIG } from "../config/ai.config.js";

const buckets = new Map();

export function isVexaAiChannel(channelId) {
    return String(channelId ?? "") === String(AI_CONFIG.channel.vexaAiChannelId);
}

function limitFor(channelId) {
    return isVexaAiChannel(channelId)
        ? AI_CONFIG.limits.vexaAiChannelLimit
        : AI_CONFIG.limits.otherChannelLimit;
}

/**
 * Cek + catat kuota user di channel tertentu.
 * @returns {{ allowed: boolean, retryAfterMs: number, remaining: number }}
 */
export function checkAiQuota(userId, channelId) {

    const key = String(userId);

    if (key === String(AI_CONFIG.limits.ownerUserId)) {
        return { allowed: true, retryAfterMs: 0, remaining: Number.MAX_SAFE_INTEGER };
    }

    const max = limitFor(channelId);
    const window = AI_CONFIG.limits.windowMs;
    const now = Date.now();
    const bucketKey = `${key}:${String(channelId ?? "dm")}`;

    const hits = (buckets.get(bucketKey) ?? []).filter(ts => now - ts < window);

    if (hits.length >= max) {
        buckets.set(bucketKey, hits);
        return {
            allowed: false,
            retryAfterMs: Math.max(window - (now - hits[0]), 0),
            remaining: 0
        };
    }

    hits.push(now);
    buckets.set(bucketKey, hits);

    return { allowed: true, retryAfterMs: 0, remaining: max - hits.length };
}

/** Reset manual (testing). */
export function resetAiQuota(userId) {
    if (userId === undefined) buckets.clear();
    else {
        const prefix = `${String(userId)}:`;
        for (const key of buckets.keys()) {
            if (key.startsWith(prefix)) buckets.delete(key);
        }
    }
}

/**
 * Sisa kuota user di sebuah channel (tanpa mencatat hit baru).
 * @returns {{ remaining: number, limit: number, used: number }}
 */
export function getAiQuota(userId, channelId) {

    const key = String(userId);

    if (key === String(AI_CONFIG.limits.ownerUserId)) {
        return { remaining: Number.MAX_SAFE_INTEGER, limit: Number.MAX_SAFE_INTEGER, used: 0, owner: true };
    }

    const max = limitFor(channelId);
    const window = AI_CONFIG.limits.windowMs;
    const now = Date.now();
    const bucketKey = `${key}:${String(channelId ?? "dm")}`;

    const hits = (buckets.get(bucketKey) ?? []).filter(ts => now - ts < window);

    return {
        remaining: Math.max(max - hits.length, 0),
        limit: max,
        used: hits.length,
        owner: false
    };
}
