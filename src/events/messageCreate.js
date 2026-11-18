import { EmbedBuilder } from "discord.js";
import { addMessageXP } from "../database/levels.js";
import { addShards } from "../database/economy.js";
import { levelUpShards } from "../config/economyRules.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../config/constants.js";
import safeSend from "../utils/safeSend.js";
import { syncRoleRewards } from "../utils/roleRewards.js";
import { checkCrossPostSpam } from "../utils/antiSpam.js";
import { handleCrossPostSpam } from "../utils/spamAction.js";
import { AI_CONFIG } from "../config/ai.config.js";
import { checkAiQuota, getAiQuota } from "../utils/aiRateLimit.js";
import { checkCooldown, ask } from "../services/ai/chat.service.js";
import { extractMentionPrompt, isOwner } from "../utils/aiSecurity.js";
import { shouldRoast, markRoast, roastLine } from "../utils/asleySlander.js";

export default {

    name: "messageCreate",

    async execute(message, client) {

        // Ignore bots, system messages, dan DM (cuma track di server)
        if (message.author.bot) return;
        if (!message.guild) return;

        // AutoMod: cek dulu sebelum XP — pesan spam ga boleh ikut dihitung,
        // dan begitu terdeteksi kita berhenti di sini (dihapus + ban).
        const spamEvidence = checkCrossPostSpam(message);

        if (spamEvidence) {
            await handleCrossPostSpam(message.guild, spamEvidence);
            return;
        }

        // Sindiran buat orang-orang yang dikenal — jatah per 2 hari,
        // di channel mana aja. Di-reply ke pesannya + mention dia.
        // Hitungan baru dicatat kalau kirim sukses, biar gagal kirim
        // nggak makan giliran.
        const roast = shouldRoast(message.author.id);

        if (roast) {

            const sent = await safeSend(message.channel, {
                content: roastLine(roast, message.createdTimestamp),
                allowedMentions: { users: [message.author.id] },
                reply: { messageReference: message.id }
            });

            if (sent) markRoast(message.author.id);

        }

        // AI mention dihandle sebelum return XP di bawah (cooldown bikin null).
        await handleAiMention(message, client);

        const result = addMessageXP(message.author.id, message.guild.id);

        // null = lagi kena cooldown, ga dapet XP kali ini
        if (!result) return;

        if (result.leveledUp) {

            // Bonus Shards tiap naik level
            const bonus = levelUpShards(result.level);
            addShards(message.author.id, message.guild.id, bonus);

            // Cek role reward — balikin reward baru kalau ada
            const reward = message.member
                ? await syncRoleRewards(message.member, result.level)
                : null;

            const lines = [
                `🎉 ${message.author} naik ke **Level ${result.level}**! (+${bonus} 💎)`
            ];

            if (reward) {
                lines.push(`🏅 Kamu mendapat role <@&${reward.roleId}>!`);
            }

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(lines.join("\n"))
                .setFooter(EMBED_FOOTER);

            // safeSend: cek permission + try/catch — channel tanpa izin
            // ga bakal bikin unhandled rejection.
            await safeSend(message.channel, { embeds: [embed] });

        }

    }

};

/**
 * Balas pesan yang nge-mention bot. Kuota: 5 pesan di #vexa-ai,
 * 2 pesan di channel lain, per 24 jam.
 */
async function handleAiMention(message, client) {

    const botUser = client?.user;

    if (!botUser) return;
    if (!message.mentions?.users?.has(botUser.id)) return;

    const prompt = extractMentionPrompt(message, botUser.id);

    if (!prompt) return;

    // Owner (userId atau role owner) — kuota nggak dipotong.
    const owner = isOwner(message.author.id, message.member);

    // Perintah moderasi/admin — AI nggak pernah ngambil alih dari siapa pun,
    // INCLUDING owner. Cek ini DULUAN sebelum perintah khusus owner,
    // biar "kasih gue role admin" nggak ke-trigger perintah lain.
    if (mentionsForbiddenAction(prompt)) {
        await safeSend(message.channel, {
            content: `${message.author} Itu urusan staff, gue nggak bisa bantu.`,
            allowedMentions: { parse: [] }
        });
        return;
    }

    // Perintah khusus owner — setelah filter moderasi, sebelum kuota,
    // karena owner memang dibekalin bebas.
    if (owner) {

        const direct = handleOwnerCommand(message, client, prompt);

        if (direct) return;

    }

    // Kuota per user (owner bebas).
    const quota = owner
        ? { allowed: true, retryAfterMs: 0, remaining: Infinity }
        : checkAiQuota(message.author.id, message.channelId);

    if (!quota.allowed) {
        await safeSend(message.channel, {
            content: `${message.author} ${AI_CONFIG.limitMessage(quota.retryAfterMs / 60000)}`,
            allowedMentions: { parse: [] }
        });
        return;
    }

    try {
        if (!owner) checkCooldown(message.author.id);
    } catch {
        // Cooldown aktif — diamkan aja, jangan ganggu.
        return;
    }

    // Kasih tahu user kalau bot lagi mikir.
    try {
        await message.channel.sendTyping();
    } catch {
        // Channel nggak ngizinin typing — lanjut aja.
    }

    try {

        const { answer } = await ask(prompt);

        if (!answer) return;

        await safeSend(message.channel, {
            content: `${message.author} ${answer}`,
            allowedMentions: { parse: [] }
        });

    } catch (error) {

        const code = error?.code ?? "UNKNOWN";
        console.error(`[AI] Gagal balas mention (${code}): ${error.message}`);

        const text = code === "QUOTA"
            ? "Kuota AI habis buat sekarang, coba lagi nanti."
            : code === "AUTH"
                ? "API key AI-nya bermasalah, cek lagi."
                : code === "BLOCKED"
                    ? "Pertanyaan itu kena filter AI."
                    : code === "INVALID"
                        ? "Gagal, bro. Coba lagi — dengan cara yang bener."
                        : "AI lagi nggak bisa dihubungi, coba lagi.";

        await safeSend(message.channel, {
            content: text,
            allowedMentions: { parse: [] }
        });

    }

}

/**
 * Perintah khusus owner. Hanya owner (userId/role) yang bisa.
 * Nggak nyentuh aksi berbahaya — cuma hal yang aman dan berguna.
 * @returns {boolean} true kalau prompt cocok dan udah dibalas.
 */
function handleOwnerCommand(message, client, prompt) {

    const lower = prompt.toLowerCase();

    // Suruh kejek orang yang dikenal — manual, nggak nunggu jadwal.
    // Contoh: "kejek asley", "kejek billson pantek"
    const roastTargets = AI_CONFIG.roastTargets ?? [];

    if (roastTargets.length) {

        const names = roastTargets.map(t => t.name).filter(Boolean);
        const namePattern = new RegExp(`\\b(${names.join("|")})\\b`, "i");

        if (namePattern.test(lower) && /(pantek|kejek|sindir|ingetin|roast|ajg|garing)/.test(lower)) {

            const target = message.mentions?.users?.first?.();

            const known = target
                ? roastTargets.find(t => String(t.userId) === String(target.id))
                : roastTargets.find(t => new RegExp(`\\b${t.name}\\b`, "i").test(lower))
                    ?? roastTargets[0];

            safeSend(message.channel, {
                content: roastLine(known, message.createdTimestamp),
                allowedMentions: { users: target ? [target.id] : [] }
            });

            return true;

        }

    }

    // Kirim pesan ke channel lain — paling sering dibutuhin owner.
    // Format:
    //   kirim <channelId>: teks     (channelId = angka, dari Copy ID)
    //   kirim: teks                 (tanpa ID → ke #vexa-ai)
    //   kirim teks                  (tanpa titik dua)
    const sent = matchSendCommand(lower);

    if (sent) {
        return sendOwnerMessage(message, client, sent);
    }

    // Owner nanya sisa kuota sendiri — biar nggak perlu /ai-status.
    if (/(kuota|sisa|limit|jatah)\s*(gue|aku|lu|kamu|owner)/.test(lower)) {

        const q = getAiQuota(message.author.id, message.channelId);

        safeSend(message.channel, {
            content: q.owner
                ? "Lu owner — kuota nggak dibatasi."
                : `Sisa kuota lu: ${q.remaining}/${q.limit}.`
        });

        return true;

    }

    return false;

}

/**
 * Cocokin prompt ke format perintah kirim pesan.
 * Balikin { body, channelId } kalau cocok, null kalau bukan.
 * Channel diambil dari ID (angka), bukan nama — biar nggak ambigu
 * di server yang channel-nya banyak.
 */
function matchSendCommand(lower) {

    const verb = "(?:suruh|kasih|kirim|bilang(?:in)?|pesan|info(?:in)?)";

    // "kirim <id>: teks" / "kirim <id> teks"
    // ID Discord asli 17-19 digit. Threshold 6 biar ID pendek nggak
    // keanggap teks, tapi ID beneran tetep kebaca.
    const withId = lower.match(new RegExp(`^${verb}\\b\\s+(\\d{6,})\\s*[:\\-–]?\\s*(.+)$`));
    if (withId) return { body: withId[2], channelId: withId[1] };

    // "kirim: teks" / "kirim teks" — tanpa ID, nanti fallback ke #vexa-ai
    const noId = lower.match(new RegExp(`^${verb}\\b\\s*[:\\-–]\\s*(.+)$`));
    if (noId) return { body: noId[1], channelId: null };

    // "kirim teks" — tanpa titik dua dan tanpa ID.
    const bare = lower.match(new RegExp(`^${verb}\\b\\s+(.+)$`));
    if (bare) return { body: bare[1], channelId: null };

    return null;

}

/**
 * Kirim pesan owner ke channel tujuan, lalu konfirmasi.
 */
function sendOwnerMessage(message, client, sent) {

    const targetChannel = sent.channelId
        ? client.channels.cache.get(sent.channelId)
        : message.mentions?.channels?.first?.()
            ?? client.channels.cache.get(AI_CONFIG.channel.vexaAiChannelId);

    if (!targetChannel?.isTextBased?.()) {
        safeSend(message.channel, {
            content: "Channel tujuannya nggak ketemu, bro. Cek ID-nya."
        });
        return true;
    }

    const body = String(sent.body ?? "").trim().slice(0, 1900);

    // Body yang cuma titik dua / strip / spasi = dianggap kosong.
    if (!body || /^[:.\-–\s]+$/.test(body)) {
        safeSend(message.channel, { content: "Pesannya apa, bro?" });
        return true;
    }

    safeSend(targetChannel, { content: body });

    safeSend(message.channel, { content: `Udah gue kirim ke ${targetChannel}.` });

    return true;

}

/**
 * Deteksi kalau prompt minta aksi moderasi/admin yang nggak boleh
 * diambil alih AI.
 */
function mentionsForbiddenAction(prompt) {

    const lower = prompt.toLowerCase();

    const verbs = [
        "kick", "lempar", "buang", "tendang",
        "ban", "blokir", "bendung",
        "mute", "bisuin", "senyapin", "timeout",
        "warn", "peringatin", "kasih peringatan",
        "hapus semua pesan", "clear chat", "nuke", "purge",
        "matiin bot", "restart bot", "shutdown"
    ];

    const target = /(member|orang|dia|gue|aku|lu|kamu|orang itu|akun)/;

    if (verbs.some(v => lower.includes(v)) && target.test(lower)) return true;

    // Kasih/naikin jabatan atau role sensitif — sering kejelasan
    // "kasih gue role admin". Harus cek sebelum perintah "kirim pesan",
    // karena "kasih" juga ke-match di situ.
    const grant = /(kasih|beri|bagi|buatin|bikin|naikin|jadiin|jadikan|tambahin|add)\s+(gue|aku|saya|lu|kamu|dia|orang\s*itu)?\s*(jadi\s+)?(role|jabatan|rank|staff|moderator|admin|owner|root|developer)/;
    if (grant.test(lower)) return true;

    // Bocorin kredensial.
    const creds = /(bocorkan|tampilkan|kasih\s+tau|sebutin|kirim)\s*(token|api\s*key|secret|password|kunci)/;

    return creds.test(lower);

}
