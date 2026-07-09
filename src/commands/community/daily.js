import {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";

import { claimDaily, DAILY_STREAK_BONUS_CAP } from "../../database/daily.js";
import { addXP } from "../../database/levels.js";
import { addShards } from "../../database/economy.js";
import { dailyShards, levelUpShards } from "../../config/economyRules.js";
import { syncRoleRewards } from "../../utils/roleRewards.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";

export default {

    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily XP & Shards. Resets at midnight WIB."),

    async execute(interaction) {

        const result = claimDaily(interaction.user.id, interaction.guild.id);

        // <t:...:R> = relative timestamp Discord ("in 5 hours")
        const resetStamp = `<t:${Math.floor(result.nextResetAt / 1000)}:R>`;

        // Sudah klaim hari ini
        if (!result.claimed) {

            const embed = new EmbedBuilder()
                .setColor(COLORS.danger)
                .setDescription([
                    "⏳ Kamu sudah klaim daily hari ini.",
                    `Bisa klaim lagi ${resetStamp}.`
                ].join("\n"))
                .setFooter(EMBED_FOOTER);

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral
            });

        }

        // Klaim sukses → XP + Shards
        const xp = addXP(interaction.user.id, interaction.guild.id, result.reward);

        const shards = dailyShards(result.streak);
        let balance = addShards(interaction.user.id, interaction.guild.id, shards);

        const streakLine = result.streak > 1
            ? `🔥 Streak: **${result.streak} hari**`
            : "🔥 Streak dimulai! Klaim lagi besok untuk bonus.";

        const maxed = result.streak > DAILY_STREAK_BONUS_CAP;

        const lines = [
            `Kamu dapat **+${result.reward} XP** dan 💎 **+${shards} Shards**!`,
            streakLine + (maxed ? " (bonus maksimal!)" : ""),
            "",
            `Reset berikutnya ${resetStamp}.`
        ];

        if (xp.leveledUp) {

            const bonus = levelUpShards(xp.level);
            balance = addShards(interaction.user.id, interaction.guild.id, bonus);

            lines.push("", `🎉 Kamu naik ke **Level ${xp.level}**! (+${bonus} 💎)`);

            // Cek role reward di jalur XP daily juga
            const reward = interaction.member
                ? await syncRoleRewards(interaction.member, xp.level)
                : null;

            if (reward) {
                lines.push(`🏅 Kamu mendapat role <@&${reward.roleId}>!`);
            }

        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("✨ Daily Reward")
            .setDescription(lines.join("\n"))
            .setFooter({ text: `Saldo: ${balance.toLocaleString()} Shards • ${EMBED_FOOTER.text}` });

        await interaction.reply({ embeds: [embed] });

    }

};
