import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { getActiveMembers } from "../../utils/giveaway.js";
import { addShards } from "../../database/economy.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

/**
 * Bagi Shards secara acak ke member yang AKTIF (punya XP).
 * Nggak ada tombol join — pemenang diundi dari member aktif.
 */
export default {

    data: new SlashCommandBuilder()
        .setName("giveaway-shards")
        .setDescription("Bagi Shards acak ke member aktif.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option
                .setName("total")
                .setDescription("Total Shards yang dibagikan.")
                .setRequired(true)
                .setMinValue(1)
        )
        .addIntegerOption(option =>
            option
                .setName("winners")
                .setDescription("Jumlah pemenang (default 3).")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(20)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Alasan giveaway (opsional).")
                .setRequired(false)
        ),

    async execute(interaction) {

        const total = interaction.options.getInteger("total");
        const winnerCount = interaction.options.getInteger("winners") ?? 3;
        const reason = interaction.options.getString("reason");

        // Defer dulu — undi + tulis DB bisa molor.
        try {
            await interaction.deferReply();
        } catch (error) {
            console.warn(`⚠️ giveaway-shards deferReply gagal (${error.code ?? "UNKNOWN"})`);
            return;
        }

        const active = getActiveMembers(interaction.guild.id);

        if (active.length === 0) {
            await interaction.editReply({
                content: "Belum ada member aktif yang tercatat. Coba lagi nanti."
            });
            return;
        }

        // Ambil pemenang acak (tanpa duplikat).
        const pool = [...active];
        const winners = [];

        while (winners.length < winnerCount && pool.length > 0) {
            const i = Math.floor(Math.random() * pool.length);
            winners.push(pool.splice(i, 1)[0]);
        }

        // Bagi rata totalnya; sisanya buat pemenang pertama.
        const base = Math.floor(total / winners.length);
        const amounts = winners.map((_, i) => (i === 0 ? total - base * (winners.length - 1) : base));

        const lines = [];
        winners.forEach((w, i) => {
            addShards(w.user_id, interaction.guild.id, amounts[i]);
            lines.push(`💎 <@${w.user_id}> — **${amounts[i].toLocaleString()} Shards**`);
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎉 Giveaway Shards")
            .setDescription([
                reason ? `*${reason}*\n` : "",
                `Total **${total.toLocaleString()} Shards** dibagi ke **${winners.length}** member aktif.`,
                "",
                ...lines
            ].filter(Boolean).join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.editReply({ embeds: [embed] });

    }

};
