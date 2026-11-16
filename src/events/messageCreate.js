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
import { checkAiQuota } from "../utils/aiRateLimit.js";
import { checkCooldown, ask } from "../services/ai/chat.service.js";
import { extractMentionPrompt, isOwner } from "../utils/aiSecurity.js";
import { shouldRoastAsley, asleyLine } from "../utils/asleySlander.js";

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

        // Sindiran buat Asley — 1x per minggu, di channel mana aja.
        if (shouldRoastAsley(message.author.id)) {
            await safeSend(message.channel, {
                content: asleyLine(message.createdTimestamp),
                allowedMentions: { parse: [] }
            });
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
 * Balas pesan yang nge-mention bot. Kuota: 2 pesan di #vexa-ai,
 * 1 pesan di channel lain, per 24 jam.
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
    // termasuk owner. Jawab pendek aja.
    if (mentionsForbiddenAction(prompt)) {
        await safeSend(message.channel, {
            content: `${message.author} Itu urusan staff, gue nggak bisa bantu.`,
            allowedMentions: { parse: [] }
        });
        return;
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

    return verbs.some(v => lower.includes(v)) && target.test(lower);

}
