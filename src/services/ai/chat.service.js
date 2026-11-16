import { AI_CONFIG } from "../../config/ai.config.js";
import { AiError, chat as geminiChat, getStatus } from "./gemini.client.js";
import { validatePrompt, sanitizeOutput } from "../../utils/aiSecurity.js";

// Jeda per user — mencegah pesan numpuk.
const lastUse = new Map();

export function checkCooldown(userId) {

    if (String(userId) === String(AI_CONFIG.limits.ownerUserId)) return;

    const cooldown = AI_CONFIG.limits.userCooldownMs;
    const now = Date.now();
    const last = lastUse.get(String(userId)) ?? 0;

    if (now - last < cooldown) {
        const wait = Math.ceil((cooldown - (now - last)) / 1000);
        throw new AiError("BUSY", `Tunggu ${wait} detik lagi.`);
    }

    lastUse.set(String(userId), now);
}

/**
 * Tanya Gemini. Tanpa history — tiap pertanyaan berdiri sendiri,
 * jadi biaya token tetap kecil dan kuota hemat.
 */
export async function ask(rawPrompt) {

    const prompt = validatePrompt(rawPrompt);

    const result = await geminiChat({
        prompt,
        systemPrompt: AI_CONFIG.systemPrompt,
        signal: AbortSignal.timeout(AI_CONFIG.requestTimeoutMs)
    });

    return {
        answer: sanitizeOutput(result.content),
        model: AI_CONFIG.model
    };

}

export { getStatus as status };
