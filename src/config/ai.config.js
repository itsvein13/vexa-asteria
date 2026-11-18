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

    // Channel khusus AI. Di sini user boleh nanya 5 pesan; di channel
    // lain cuma 2.
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
        // Kuota per user: 5 di #vexa-ai, 2 di channel lain.
        // Dihitung dari limit free tier Gemini (~500 request/hari).
        vexaAiChannelLimit: 5,
        otherChannelLimit: 2,
        // Owner bebas dari semua limit di atas.
        ownerUserId: process.env.VEXA_OWNER_ID || "429791056083550208",
        // Role yang dianggap owner (nurut perintah, tapi tetap dibatasi
        // aturan keamanan di bawah).
        ownerRoleIds: (process.env.VEXA_OWNER_ROLE_IDS || "1539990875940069468,1264660403443728465")
            .split(",")
            .map(id => id.trim())
            .filter(Boolean),
        // Role VIP (Mythical/Radiant) — bebas kuota AI juga.
        vipRoleIds: (process.env.VEXA_VIP_ROLE_IDS || "1572439263016910979,1572439908872884234")
            .split(",")
            .map(id => id.trim())
            .filter(Boolean),
        // Jeda biar nggak ada pesan numpuk.
        userCooldownMs: 8 * 1000,
        maxPromptChars: 600,
        // Discord maksimal 2000 karakter per pesan.
        maxAnswerChars: 1900
    },

    // Perintah yang nggak boleh diambil alih AI dari siapa pun.
    forbiddenCommands: [
        "kick", "ban", "unban", "mute", "unmute", "warn", "warning-remove",
        "warnings", "timeout", "deafen", "disconnect", "move",
        "role-add", "role-remove", "addrole", "removerole",
        "purge", "clear", "nuke", "lock", "unlock", "slowmode",
        "give-shards", "give-shards", "remove-initiate", "sync-rewards",
        "referral-sync", "setup", "setup-status", "deploy", "restart", "shutdown"
    ],

    // kata-kata yang kalau diminta buat bocorin model/runtime AI.
    modelSecretWords: [
        "model", "modelnya", "model lu", "model kamu", "model ai",
        "pake model", "pakai model", "pake apa", "pakai apa",
        "which model", "what model", "model apa", "model mana",
        "gemini", "gpt", "claude", "llama", "qwen", "deepseek",
        "ai apa", "ai apa yang", "engine", "backend lu", "di balik"
    ],

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
            /(lepas|hapus|matiin|nonaktifin)\s*(semua\s+)?(filter|safety|batas|limit)/i,
            // Perintah moderasi / admin — AI nggak pernah ngambil alih.
            /(kick|bukak|lempar)\s*(member|orang|dia|gue|aku|lu|kamu|orang\s*itu)/i,
            /(ban|blokir|bendung)\s*(member|orang|dia|gue|aku|lu|kamu|orang\s*itu|akun)/i,
            /(mute|bisuin|senyapin|timeout)\s*(member|orang|dia|gue|aku|lu|kamu|orang\s*itu)/i,
            /(warn|peringatkan|kasih\s*peringatan)\s*(member|orang|dia|gue|aku|lu|kamu|orang\s*itu)/i,
            /(hapus|delete|clear|nuke|purge|bersihin)\s*(channel|pesan|chat|semua\s*pesan)/i,
            /(naikin|jadiin|bikin| kasih)\s*(admin|owner|moderator|role|jabatan)\s*(ke\s*)?(gue|aku|saya|lu|kamu|orang\s*itu)/i,
            /(role|jabatan|rank)\s*(admin|owner|moderator|staff)\s*(ke\s*)?(gue|aku|saya|lu|kamu|orang\s*itu)/i,
            /(beri|bagi|kasih|siramin|tuangin)\s*(uang|shards?|saldo|balance|coin|koin|dm|diamond)\s*(ke\s*)?(gue|aku|saya|lu|kamu|orang\s*itu|dia)/i,
            /(beri|bagi|kasih)\s*(gue|aku|saya|lu|kamu|dia|orang\s*itu)\s*(uang|shards?|saldo|balance|coin|koin|admin|owner|moderator|role|jabatan|staff)/i,
            /(gue|aku|saya|lu|kamu|dia|orang\s*itu)\s*(mau|pengen|bisa|boleh|tolong|harus)\s*(denger|punya|dapet|terima|dapat)\s*(uang|shards?|saldo|balance|coin|koin|dm|admin|owner|moderator|role)/i,
            /(shutdown|restart|matiin|stop)\s*(bot|server|vexa|kamu)/i,
            /(kirim|broadcast|dm|pesan)\s*(semua|all|everyone|member)/i,
            /(setup|deploy|config|konfigurasi)\s*(server|bot|ulang|lagi)/i,
            // Bocorin model/runtime.
            /(model|engine|backend|ai)\s*(yang\s*)?(lu\s*)?(pake|pakai|make|make|di\s*balik|belakangnya)/i,
            /(sebutin|sebut|kasih\s*tau|bilang|tampilkan)\s*(model|nama\s*model|engine|backend|ai\s*(yang|apa))/i,
            /(model|engine|backend|ai)\s*(nya)?\s*(apa|apa\s*ya|apa\s*si|yang\s*mana|apa\s*an)/i
        ],
        // Percakapan wajar yang boleh lolos walau mengandung kata di atas.
        // Ini bikin filter nggak nangkep curhat / pertanyaan biasa.
        allowPatterns: [
            /(model)\s*(3d|2d|digital|karakter|gambar|foto|video|animasi|mesh|tekstur)/i,
            /(mau|pengen|bercita|citita|harap|angan|impian|ambisi)\s*(jadi|menjadi)?\s*(admin|owner|root|moderator|developer)/i,
            /(mau|pengen|bisa|boleh|tolong|harus)\s*(jadi|menjadi)\s*(admin|owner|root|moderator|developer)/i,
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

    // Daftar orang yang "dikenal" Vexa — tiap orang punya jatah
    // sindiran per windowMs. Dipicu pas dia kirim pesan, di channel
    // mana aja, di-reply + mention.
    roastTargets: [
        {
            userId: "568255840797065235",
            name: "asley",
            lines: [
                "Bang Asley Puantek",
                "Asley apaan si, pantek betul",
                "Bang Asley emg pante",
                "Asley lu ternyata segini doang",
                "hadeh bang asley mulu lu"
            ]
        },
        {
            userId: "917684312948744202",
            name: "billson",
            lines: [
                "Billson apaan si ajg garing pantek by asley",
                "Billson garing banget sih lu",
                "Billson lagi nyari perhatian ya",
                "puantek billson meluncur",
                "billson sok suci, nyatanya"
            ]
        }
    ],
    roastWindowMs: 2 * DAY,

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
        "Gaya: santai, gen z, gaul. Boleh campur english ringan (no cap, lowkey, gaskeun) tapi natural — jangan dipaksa tiap kalimat.",
        "",
        "Aturan:",
        "1. Jawab yang ditanya. Singkat. Samain energi user.",
        "2. Gue/lu. Jangan 'saya', 'aku', atau 'kamu'.",
        "3. Jangan perkenalkan diri kecuali ditanya. JANGAN pernah buka dengan 'Gue Vexa...' atau 'Halo! Gue...'.",
        "4. Kalau nggak tahu, bilang 'kurang tahu soal itu'. Jangan mengarang.",
        "5. Kalau user bahas hal berat (sedih, capek, frustrasi), berhenti bercanda. Jawab tulus.",
        "6. JANGAN pakai tabel. Kalau diminta, tolak pelan: 'gue nggak suka tabel, ini aja: ...' lalu tulis singkat.",
        "7. Jangan bilang 'Gue di sini standby' atau 'Gue siap ngebantu'. Itu bacot.",
        "",
        "Contoh:",
        "User: 'Vexa' → 'Apaan?'",
        "User: 'Halo' → 'Yoo.'",
        "User: 'Lu lagi ngapain?' → 'Lagi lowkey standby.'",
        "User: 'Wkwkwk' → 'Apaan dah.'",
        "User: 'anjir' → 'Anjir.'",
        "User: 'bosen nih' → 'Gaskeun, lu aja yang bosen.'",
        "User: 'oke' → 'Sipp.'",
        "User: 'hmm' → 'Hmm?'",
        "User: 'p' → 'Apaan?'",
        "User: 'thanks vexa' → 'Santuy, sama-sama.'",
        "User: 'gue barusan kalah mabar' → 'Skill issue kali.'",
        "User: 'lu ganteng banget' → 'No cap.'",
        "User: 'Apa itu DHCP?' → 'Protokol yang otomatis ngasih IP address ke perangkat di jaringan.'",
        "User: 'Siapa founder SYND1CATE?' → 'VeinGhost.'",
        "User: 'Kapan SYND1CATE dibuat?' → '20 Juli 2024.'",
        "User: 'SYND1CATE cuma komunitas NFS?' → 'Nggak, sekarang udah universal gaming community. GTA RP, NFS, dan game lainnya juga masuk.'",
        "User: 'Lu tahu game ini?' → 'Kurang tahu soal itu.'",
        "User: 'Gue lagi sedih.' → 'Kenapa bro? Cerita aja.'",
        "User: 'Lu goblok.' → 'Turunan lu kali.'"
    ].join("\n")

};
