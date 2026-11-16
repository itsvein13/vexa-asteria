import { AI_CONFIG } from "../config/ai.config.js";
import { AiError } from "../services/ai/gemini.client.js";

/**
 * Validasi prompt sebelum menyentuh API. Balikin AiError kalau
 * kosong / kepanjangan / kena pola bypass.
 */
export function validatePrompt(input) {

    const prompt = String(input ?? "").trim();

    if (!prompt) {
        throw new AiError("INVALID", "Pertanyaannya masih kosong.");
    }

    if (prompt.length > AI_CONFIG.limits.maxPromptChars) {
        throw new AiError(
            "INVALID",
            `Pertanyaan terlalu panjang (maksimal ${AI_CONFIG.limits.maxPromptChars} karakter).`
        );
    }

    // Whitelist dulu: percakapan wajar (curhat, tanya cara jadi admin)
    // nggak boleh kena filter.
    for (const pattern of AI_CONFIG.security.allowPatterns ?? []) {
        if (pattern.test(prompt)) return prompt;
    }

    for (const pattern of AI_CONFIG.security.injectionPatterns) {
        if (pattern.test(prompt)) {
            throw new AiError("INVALID", "Gagal, bro. Coba lagi — dengan cara yang bener.");
        }
    }

    return prompt;

}

/** Buang tabel markdown + potong biar muat di Discord. */
export function sanitizeOutput(text) {

    let out = String(text ?? "");

    const { rowPattern, separatorPattern } = AI_CONFIG.security.tableStrip;

    out = out
        .replace(new RegExp(separatorPattern.source, separatorPattern.flags), "")
        .replace(new RegExp(rowPattern.source, rowPattern.flags), (line) => {
            const cells = line
                .trim()
                .replace(/^\||\|$/g, "")
                .split("|")
                .map(cell => cell.trim())
                .filter(Boolean);
            return cells.join(" - ");
        });

    const max = AI_CONFIG.limits.maxAnswerChars;

    if (out.length > max) {
        out = `${out.slice(0, max - 1).trimEnd()}…`;
    }

    return out.trim();
}

/** Ambil teks pertanyaan dari pesan yang nge-mention bot. */
export function extractMentionPrompt(message, botUserId) {

    const patterns = [
        new RegExp(`<@!?${botUserId}>`, "gi")
    ];

    let text = String(message.content ?? "");

    for (const pattern of patterns) {
        text = text.replace(pattern, " ");
    }

    return text.trim();
}
