import { AI_CONFIG } from "../../config/ai.config.js";

// Error bertipe supaya handler bisa milih pesan yang aman.
export class AiError extends Error {

    constructor(code, message) {
        super(message);
        this.name = "AiError";
        this.code = code;
    }

}

/**
 * Request mentah ke Gemini. Semua kegagalan diterjemahkan jadi AiError;
 * prompt dan jawaban tidak pernah di-log di sini.
 */
async function generate({ prompt, systemPrompt, signal }) {

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`;

    let response;

    try {

        response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: AI_CONFIG.generate.temperature,
                    maxOutputTokens: AI_CONFIG.generate.maxOutputTokens
                }
            }),
            signal
        });

    } catch (error) {

        if (error?.name === "AbortError" || error?.name === "TimeoutError") {
            throw new AiError("TIMEOUT", "AI-nya mikir kepanjangan. Coba lagi.");
        }

        throw new AiError("OFFLINE", "AI lagi nggak bisa dihubungi.");
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new AiError("BAD_RESPONSE", "Respons AI nggak bisa dibaca.");
    }

    if (!response.ok) {

        const detail = String(data?.error?.message ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);

        if (/429|rate limit|quota|resource has been exhausted|high demand|temporarily/i.test(detail)) {
            throw new AiError("QUOTA", "Kuota AI habis buat sekarang. Coba lagi nanti.");
        }

        if (/404|not found|no longer available|unsupported/i.test(detail)) {
            throw new AiError("MODEL_MISSING", `Model ${AI_CONFIG.model} nggak bisa dipakai.`);
        }

        if (/401|403|permission|api key/i.test(detail)) {
            throw new AiError("AUTH", "API key AI-nya bermasalah.");
        }

        throw new AiError("PROVIDER", detail || `Gemini balas HTTP ${response.status}.`);
    }

    const candidate = data?.candidates?.[0];

    // Diblokir filter Gemini.
    if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "BLOCKLIST") {
        throw new AiError("BLOCKED", "Pertanyaan itu kena filter AI. Coba diubah.");
    }

    const content = String(candidate?.content?.parts?.[0]?.text ?? "").trim();

    if (!content) {
        throw new AiError("EMPTY", "AI nggak ngasalah jawaban. Coba lagi.");
    }

    return { content, elapsedMs: 0 };
}

/** Status ringkas: model + apakah API key bisa dipakai. */
export async function getStatus() {

    const startedAt = Date.now();

    try {
        await generate({
            prompt: "ping",
            systemPrompt: "Balas satu kata.",
            signal: AbortSignal.timeout(20 * 1000)
        });
        return { ok: true, model: AI_CONFIG.model, elapsedMs: Date.now() - startedAt };
    } catch (error) {
        return { ok: false, model: AI_CONFIG.model, error: error.message, elapsedMs: Date.now() - startedAt };
    }

}

export { generate as chat };
