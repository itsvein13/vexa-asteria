import { EmbedBuilder } from "discord.js";
import { addMessageXP } from "../database/levels.js";
import { addShards } from "../database/economy.js";
import { levelUpShards } from "../config/economyRules.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../config/constants.js";
import safeSend from "../utils/safeSend.js";
import { syncRoleRewards } from "../utils/roleRewards.js";
import { checkCrossPostSpam } from "../utils/antiSpam.js";
import { handleCrossPostSpam } from "../utils/spamAction.js";

export default {

    name: "messageCreate",

    async execute(message) {

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

    }

};
