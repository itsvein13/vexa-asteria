import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { spendShards } from "../../database/economy.js";
import { getShopBadges } from "../../database/shopBadges.js";
import { rollGacha, awardBadge, isDuplicate } from "../../utils/gacha.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";

/**
 * Gacha: bayar Shards, dapet badge acak dari katalog server.
 */
export default {

    data: new SlashCommandBuilder()
        .setName("gacha")
        .setDescription("Tarik gacha — dapet badge acak."),

    async execute(interaction) {

        const badges = getShopBadges(interaction.guild.id);

        if (badges.length === 0) {
            return interaction.reply({
                content: "Belum ada badge di katalog. Minta admin isi pakai `/shop-badge-add`.",
                flags: MessageFlags.Ephemeral
            });
        }

        const price = Math.min(...badges.map(b => b.price));

        const result = spendShards(interaction.user.id, interaction.guild.id, price);

        if (!result.ok) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.danger)
                .setDescription(`❌ Saldo kurang — gacha butuh 💎 **${price.toLocaleString()}**, saldomu **${result.balance.toLocaleString()}**.`)
                .setFooter(EMBED_FOOTER);
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const badge = rollGacha(interaction.guild.id);

        // Cek duplikat SEBELUM kasih, kalau nanti malah selalu "duplikat".
        const dup = isDuplicate(interaction.user.id, interaction.guild.id, badge);

        awardBadge(interaction.user.id, interaction.guild.id, badge);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎰 Gacha")
            .setDescription([
                `Kamu dapet ${badge.emoji} **${badge.name}**!`,
                dup ? "-# (duplikat, udah punya yang sama)" : "",
                "",
                `Sisa saldo: 💎 **${result.balance.toLocaleString()} Shards**`
            ].filter(Boolean).join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};
