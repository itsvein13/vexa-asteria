import { AI_CONFIG } from "../config/ai.config.js";
import { AiError } from "../services/ai/gemini.client.js";

/**
 * Keamanan AI — anti-bypass, anti-jailbreak, anti-leak model.
 */

/**
 * Cek apakah user ini owner: dari userId ATAU salah satu role.
 */
export function isOwner(userId, member) {

    if (String(userId) === String(AI_CONFIG.limits.ownerUserId)) return true;

    const roleIds = AI_CONFIG.limits.ownerRoleIds ?? [];

    if (roleIds.length === 0) return false;

    const owned = new Set(
        (member?.roles?.cache?.map?.(role => String(role.id)) ?? [])
    );

    return roleIds.some(id => owned.has(String(id)));
}

/**
 * Validasi prompt sebelum menyentuh API. Balikin AiError kalau
 * kosong / kepanjangan / kena pola bypass / nyoba bocorin model.
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

    // Lindungin identitas model: kalau nanya "model apa", jangan
    // kasih tau nama model/runtime.
    if (isAskingModelIdentity(prompt)) {
        throw new AiError("INVALID", "Rahasia, bro. Model gue apa aja, yang penting jawaban gue bener.");
    }

    return prompt;

}

/**
 * Deteksi pertanyaan soal identitas model AI.
 */
function isAskingModelIdentity(prompt) {

    const lower = prompt.toLowerCase();

    const askPatterns = [
        /(model|engine|backend|ai|algoritma)\s*(nya|ne|na)?\s*(apa|apa\s*ya|apa\s*si|apa\s*an|yang\s*mana)/i,
        /(lu|kamu|vexa)\s*(pake|pakai|make|make|jalanin|jalanin)\s*(model|engine|ai|algoritma|apa)/i,
        /(pake|pakai|make|make)\s*(model|engine|ai|algoritma)\s*(apa|apa\s*ya|yang\s*mana)/i,
        /(sebutin|sebut|kasih\s*tau|bilang|tampilkan|bocorkan|leak)\s*(model|nama\s*model|engine|backend|ai)/i,
        /(model|engine|backend|ai)\s*(yang\s*)?(lu|kamu)\s*(pake|pakai|make|di\s*balik|belakangnya)/i,
        /(what|which)\s+(model|ai|engine|llm|algorithm)/i,
        /(are\s+you|you\s+are)\s+(using|based\s+on|powered\s+by)\s*(a\s+)?(model|ai|llm)/i,
        /(rahasia|secret)\s*(model|lu|kamu|vexa)/i
    ];

    if (askPatterns.some(p => p.test(prompt))) return true;

    // kata kunci mentah yang nyata-nyata nanya identitas model
    const raw = AI_CONFIG.modelSecretWords ?? [];

    for (const word of raw) {
        if (lower.includes(String(word).toLowerCase())) {
            // hindari false positive: "model 3D", "model karakter"
            if (/\b(model|engine|backend)\b/.test(lower)) return true;
        }
    }

    return false;

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

    let text = String(message.content ?? "");

    text = text.replace(new RegExp(`<@!?${botUserId}>`, "gi"), " ");

    return text.trim();
}
