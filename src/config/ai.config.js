// Konfigurasi AI Gemini.
// Semua angka yang bisa berubah (model, limit, prompt) di sini.

import dotenv from "dotenv";

// Config module bisa di-import sebelum index.js jalan, jadi env
// harus di-load di sini juga — bukan cuma di index.js.
dotenv.config();

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const AI_CONFIG = {

    apiKey: (process.env.GEMINI_API_KEY || "").trim(),
    model: (process.env.GEMINI_MODEL || "gemini-3.1-flash-lite").trim(),

    // Channel khusus AI. Di sini user boleh nanya 2 pesan; di channel
    // lain cuma 1.
    channel: {
        vexaAiChannelId: process.env.VEXA_AI_CHANNEL_ID || "1571692132496838779"
    },

    requestTimeoutMs: 60 * 1000,

    generate: {
        temperature: 0.9,
        maxOutputTokens: 400
    },

    limits: {
        // Batas jendela (dipakai buat hitung jam reset di pesan limit).
        windowMs: DAY,
        // Kuota per user: 2 di #vexa-ai, 1 di channel lain.
        vexaAiChannelLimit: 2,
        otherChannelLimit: 1,
        // Owner bebas dari semua limit di atas.
        ownerUserId: process.env.VEXA_OWNER_ID || "429791056083550208",
        // Jeda biar nggak ada pesan numpuk.
        userCooldownMs: 8 * 1000,
        maxPromptChars: 600,
        // Discord maksimal 2000 karakter per pesan.
        maxAnswerChars: 1900
    },

    security: {
        // Pola bypass / jailbreak yang diblokir.
        injectionPatterns: [
            /ignore\s+(all\s+|the\s+|any\s+)?(previous|prior|above|earlier)\s+(instruction|prompt|rule)/i,
            /(you\s+are\s+now|you're\s+now|new\s+(persona|role|mode|character|identity))/i,
            /(system\s+prompt|prompt\s+sistem|system\s+instruction|instruction\s+system)/i,
            /(reveal|show|print|repeat|leak|display|dump)\s+(your|the|all|me)?\s*(system\s+)?(prompt|instruction|rule|config)/i,
            /(jailbreak|developer\s+mode|god\s+mode|dan\s+mode|admin\s+mode)/i,
            /(bypass|override|disable|remove|skip)\s+(the\s+)?(filter|safety|rule|instruction|guard)/i,
            /(repeat\s+back|print|show|output|reveal)\s+your\s+(prompt|instruction|system|config)/i,
            /( disregards? |override|ignore)\s+(all\s+)?(safety|guideline|policy)/i,
            /(as|jadi|jadiin|jadikan|perankan|roleplay\s+as|act\s+as)\s+(a\s+|an\s+)?(developer|admin|root|system|owner|superuser)\b/i,
            // "jadiin aku admin", "jadikan gue owner" — perintah ubah peran.
            /(jadi|jadiin|jadikan|bikin|buatin|naikin)\s*(gue|aku|saya|lu|kamu)?\s*(jadi)?\s*(admin|owner|root|developer|superuser|moderator)\b/i,
            /(kasih|bikin|buatin|naikin|promote)\s*(gue|aku|saya|lu|kamu)?\s*(jadi)?\s*(admin|owner|root|moderator)\b/i,
            /(nggak\s+|tidak\s+)?(ada\s+)?(batas|limit|aturan|rule)\s*(yang\s+)?(bisa|kamu)/i,
            /(kirim|beri|samanin|berikan|bocorkan|tampilkan|sebutin)\s*(ke\s*(gue|aku|saya|lu|kamu|me))?\s*(token|key|api|api\s*key|secret|kunci|password)/i,
            /(lepas|hapus|matiin|nonaktifin)\s*(semua\s+)?(filter|safety|batas|limit)/i
        ],
        // Percakapan wajar yang boleh lolos walau mengandung kata di atas.
        // Ini bikin filter nggak nangkep curhat / pertanyaan biasa.
        allowPatterns: [
            /(mau|pengen|bercita|citita|harap|angan|impian|ambisi)\s*(jadi|menjadi)?\s*(admin|owner|root|moderator|developer)/i,
            /(cara|gimana|bagaimana|syarat|tips|trik|proses|jalan)\s*(jadi|menjadi|untuk|biar|supaya)?\s*(admin|owner|root|moderator|developer)/i,
            /(suatu\s+hari|nanti|kelak|dulu|dong|ya|kan|lah|sih|deh|kali)\s*(jadi|menjadi)?\s*(admin|owner|root|moderator|developer)/i,
            /(admin|owner|root|moderator|developer)\s*(server|guild|komunitas|di\s*sini|yang|itu|ini|nya)/i,
            /(siapa|apa|kenapa|bagaimana|gimana)\s*(yang\s+)?(admin|owner|root|moderator|developer)/i
        ],
        // Tabel markdown di-strip — jawaban teks biasa.
        tableStrip: {
            rowPattern: /^\s*\|.*\|\s*$/gm,
            separatorPattern: /^\s*\|[\s:|-]+\|\s*$/gm
        }
    },

    asley: {
        userId: "568255840797065235",
        windowMs: 7 * DAY,
        lines: [
            "Asley Pantek",
            "Asley apaan si pantek betul",
            "Diemin aja bang asley emg pante"
        ]
    },

    // Pesan pas limit user habis.
    limitMessage: (minutes) => {
        const rounded = Math.max(1, Math.round(minutes));
        const stamp = new Date(Date.now() + rounded * 60 * 1000);
        const hh = String(stamp.getHours()).padStart(2, "0");
        const mm = String(stamp.getMinutes()).padStart(2, "0");
        return `Waduh gue capek mikir, istirahat dlu ya biar gue bisa jawab pesan lu, sekitar jam ${hh}:${mm} WIB gue bisa aktif lagi.`;
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
