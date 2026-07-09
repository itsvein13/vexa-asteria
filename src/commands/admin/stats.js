import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getServerStats } from "../../database/stats.js";
import { getShopItem } from "../../config/shopItems.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Server activity & economy statistics.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const s = getServerStats(interaction.guild.id);

        const salesLines = s.sales.length
            ? s.sales.map(row => {
                const item = getShopItem(row.item_id);
                const name = item ? `${item.emoji} ${item.name}` : row.item_id;
                return `${name} — **${row.sold}** terjual`;
            })
            : ["Belum ada pembelian."];

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("📊 Vexa Stats")
            .setDescription([

                "**📈 Aktivitas**",
                `Member ber-XP: **${s.members.toLocaleString()}**`,
                `Total XP server: **${s.totalXP.toLocaleString()}**`,
                `Level tertinggi: **${s.topLevel}**`,
                "",
                "**📅 Daily**",
                `Klaim hari ini: **${s.claimsToday}**`,
                `Klaim 7 hari terakhir: **${s.claimsWeek}**`,
                `Streak aktif (≥2 hari): **${s.activeStreaks}** • terpanjang: **${s.longestStreak}** hari`,
                "",
                "**💎 Economy**",
                `Shards beredar: **${s.circulating.toLocaleString()}**`,
                `Pemegang saldo: **${s.holders}** • saldo tertinggi: **${s.richest.toLocaleString()}**`,
                "",
                "**🛒 Shop**",
                ...salesLines

            ].join("\n"))
            .setFooter(EMBED_FOOTER)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

    }

};
