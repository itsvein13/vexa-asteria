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
import { checkAiRateLimit } from "../utils/aiRateLimit.js";
import { checkCooldown, ask } from "../services/ai/chat.service.js";
import { extractMentionPrompt } from "../utils/aiSecurity.js";

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

        // AI mention: @Vexa <pertanyaan>
        await handleAiMention(message, client);

    }

};

/**
 * Balas pesan yang nge-mention bot. Jawaban dikirim sebagai reply
 * ke pesan user, jadi konteksnya jelas.
 */
async function handleAiMention(message, client) {

    const botUser = client?.user;

    if (!botUser) return;
    if (!message.mentions?.users?.has(botUser.id)) return;

    const prompt = extractMentionPrompt(message, botUser.id);

    if (!prompt) return;

    // Rate limit — owner dikecualikan.
    const limit = checkAiRateLimit(
        message.author.id,
        AI_CONFIG.limits.rateLimit
    );

    if (!limit.allowed) {
        const seconds = Math.ceil(limit.retryAfterMs / 1000);
        await safeSend(message.channel, {
            content: `⏳ ${message.author} terlalu banyak nanya. Coba lagi dalam ${seconds} detik.`
        });
        return;
    }

    try {
        checkCooldown(message.author.id);
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

        const startedAt = Date.now();
        const { answer } = await ask(prompt);
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

        if (!answer) return;

        await safeSend(message.channel, {
            content: `${message.author} ${answer}\n-# ${AI_CONFIG.model} • ${elapsed}s`,
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
                    : "AI lagi nggak bisa dihubungi, coba lagi.";

        await safeSend(message.channel, {
            content: text,
            allowedMentions: { parse: [] }
        });

    }

}
