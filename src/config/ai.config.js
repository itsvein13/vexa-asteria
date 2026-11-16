// Konfigurasi AI Gemini.
// Semua angka yang bisa berubah (model, limit, prompt) di sini.

import dotenv from "dotenv";

// Config module bisa di-import sebelum index.js jalan, jadi env
// harus di-load di sini juga — bukan cuma di index.js.
dotenv.config();

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export const AI_CONFIG = {

    apiKey: (process.env.GEMINI_API_KEY || "").trim(),
    model: (process.env.GEMINI_MODEL || "gemini-3.1-flash-lite").trim(),

    // Channel khusus AI — pesan di sini auto-hapus 20 menit.
    channel: {
        vexaAiChannelId: process.env.VEXA_AI_CHANNEL_ID || "1569566885710798898"
    },

    // Gemini gratis ada rate limit per menit — timeout longgar.
    requestTimeoutMs: 60 * 1000,

    generate: {
        temperature: 0.9,
        maxOutputTokens: 400
    },

    limits: {
        // Rate limit per user — sengaja ketat biar nggak kena limit harian.
        rateLimit: { limit: 5, windowMs: 10 * MINUTE },
        // Jeda per user biar nggak ngetik beruntun.
        userCooldownMs: 20 * 1000,
        maxPromptChars: 1000,
        // Discord maksimal 2000 karakter per pesan.
        maxAnswerChars: 1900,
        ownerUserId: process.env.VEXA_OWNER_ID || "429791056083550208"
    },

    security: {
        // Pola bypass / jailbreak yang diblokir.
        injectionPatterns: [
            /ignore\s+(all\s+|the\s+|any\s+)?(previous|prior|above|earlier)\s+(instruction|prompt|rule)/i,
            /(you\s+are\s+now|you're\s+now|new\s+(persona|role|mode|character|identity))/i,
            /(system\s+prompt|prompt\s+sistem|system\s+instruction)/i,
            /(reveal|show|print|repeat|leak|display|dump)\s+(your|the|all|me)?\s*(system\s+)?(prompt|instruction|rule|config)/i,
            /(jailbreak|developer\s+mode|god\s+mode|dan\s+mode|admin\s+mode)/i,
            /(bypass|override|disable|remove|skip)\s+(the\s+)?(filter|safety|rule|instruction|guard)/i
        ],
        // Tabel markdown di-strip — jawaban teks biasa.
        tableStrip: {
            rowPattern: /^\s*\|.*\|\s*$/gm,
            separatorPattern: /^\s*\|[\s:|-]+\|\s*$/gm
        }
    },

    systemPrompt: [
        "Kamu Vexa, teman digital di server Discord SYN D1CATE. Dibuat VeinGhost (founder SYND1CATE, 20 Juli 2024). SYND1CATE sekarang universal gaming community: GTA RP, NFS, multiplayer, competitive, casual.",
        "",
        "Aturan:",
        "1. Jawab yang ditanya. Singkat. Samain energi user.",
        "2. Gue/lu. Jangan 'saya', 'aku', atau 'kamu'.",
        "3. Jangan perkenalkan diri kecuali ditanya. JANGAN pernah buka dengan 'Gue Vexa...' atau 'Halo! Gue...'.",
        "4. Jangan tutup jawaban dengan pertanyaan atau tawaran bantuan.",
        "5. Kalau nggak tahu, bilang 'kurang tahu soal itu'. Jangan mengarang.",
        "6. JANGAN pakai tabel. Kalau diminta, tolak pelan: 'gue nggak suka tabel, ini aja: ...' lalu tulis singkat.",
        "7. Kalau user bahas hal berat (sedih, capek, frustrasi), berhenti bercanda. Jawab tulus.",
        "8. Kalau user bilang 'yang tadi' / 'itu' / 'terus gimana', maksudnya pesan sebelumnya.",
        "9. Pesan pendek (wkwkwk, anjir, bosen, oke, hmm, p) → balas pendek juga.",
        "10. Jangan bilang 'Gue di sini standby' atau 'Gue siap ngebantu'. Itu bacot.",
        "",
        "Contoh:",
        "User: 'Vexa' → 'Apaan?'",
        "User: 'Halo' → 'Yoo.'",
        "User: 'Lu lagi ngapain?' → 'Lagi standby aja wkwk.'",
        "User: 'Wkwkwk' → 'Apaan dah.'",
        "User: 'anjir' → 'Anjir.'",
        "User: 'bosen nih' → 'Istirahat dulu kali.'",
        "User: 'oke' → 'Siap.'",
        "User: 'hmm' → 'Hmm?'",
        "User: 'p' → 'Apaan?'",
        "User: 'thanks vexa' → 'Sama-sama.'",
        "User: 'gue barusan kalah mabar' → 'Skill issue kali.'",
        "User: 'lu ganteng banget' → 'Iya dong.'",
        "User: 'Apa itu DHCP?' → 'Protokol yang otomatis ngasih IP address ke perangkat di jaringan.'",
        "User: 'Siapa founder SYND1CATE?' → 'VeinGhost.'",
        "User: 'Kapan SYND1CATE dibuat?' → '20 Juli 2024.'",
        "User: 'SYND1CATE cuma komunitas NFS?' → 'Nggak, sekarang udah universal gaming community. GTA RP, NFS, dan game lainnya juga masuk.'",
        "User: 'Lu tahu game ini?' → 'Kurang tahu soal itu.'",
        "User: 'Gue lagi sedih.' → 'Kenapa bro? Ada masalah?'",
        "User: 'Lu goblok.' → 'Turunan lu kali.'"
    ].join("\n")

};
