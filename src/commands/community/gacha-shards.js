import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { spendShards, addShards } from "../../database/economy.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";
import safeSend from "../../utils/safeSend.js";

// Peluang jackpot (1 banding sekian). Sengaja kecil.
const JACKPOT_CHANCE = 0.02;
const MAX_JACKPOT = 50000;

/** Kalimat buat yang dapet biasa. */
const NORMAL_LINES = [
    "Mayan lah, pelan-pelan menang",
    "Gas lagi, siapa tau berikutnya gede",
    "Nggak segede itu, tapi tetep serah",
    "Hampir aja, coba lagi nanti"
];

/** Kalimat buat yang kena JACKPOT. */
const JACKPOT_LINES = [
    "JACKPOT! 🎉 Lu baru aja nabrak gede!",
    "BOOM! 💥 Jackpot nyangkut di lu!",
    "GILA! 🎊 Lu pecahin jackpot!",
    "JACKPOT!!! 🔥 Lu sultan hari ini!"
];

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function roll(rng = Math.random) {
    return rng() < JACKPOT_CHANCE
        ? { jackpot: true, amount: MAX_JACKPOT }
        : { jackpot: false, amount: 50 + Math.floor(rng() * 451) }; // 50-500
}

/**
 * Gacha Shards: bayar Shards, dapet Shards acak. Kena jackpot = gede.
 */
export default {

    data: new SlashCommandBuilder()
        .setName("gacha-shards")
        .setDescription("Tarik gacha Shards — dapet Shards acak, kena jackpot = gede!")
        .addIntegerOption(option =>
            option
                .setName("price")
                .setDescription("Harga tarikan (default 500).")
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {

        const price = interaction.options.getInteger("price") ?? 500;

        const paid = spendShards(interaction.user.id, interaction.guild.id, price);

        if (!paid.ok) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.danger)
                .setDescription(`❌ Saldo kurang — tarikan butuh 💎 **${price.toLocaleString()}**, saldomu **${paid.balance.toLocaleString()}**.`)
                .setFooter(EMBED_FOOTER);
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const result = roll();
        const balance = addShards(interaction.user.id, interaction.guild.id, result.amount);

        const embed = new EmbedBuilder()
            .setColor(result.jackpot ? "#FFC107" : EMBED_COLOR)
            .setTitle(result.jackpot ? "🎰 JACKPOT!" : "🎰 Gacha Shards")
            .setDescription([
                result.jackpot ? pick(JACKPOT_LINES) : pick(NORMAL_LINES),
                "",
                `Lu dapet 💎 **${result.amount.toLocaleString()} Shards** dari tarikan ${price.toLocaleString()}.`,
                "",
                `Saldo sekarang: 💎 **${balance.toLocaleString()} Shards**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        // Jackpot = pengumuman publik, biar rame. Nggak ephemeral.
        if (result.jackpot) {

            const channel = interaction.channel;

            if (channel?.isTextBased?.()) {

                const announcement = new EmbedBuilder()
                    .setColor("#FFC107")
                    .setTitle("🎰 JACKPOT!")
                    .setDescription([
                        `🎉 **${interaction.user}** kena JACKPOT gacha Shards!`,
                        "",
                        `Menang 💎 **${result.amount.toLocaleString()} Shards** — sultan baru di sini! 🔥`
                    ].join("\n"))
                    .setFooter(EMBED_FOOTER);

                await safeSend(channel, { embeds: [announcement] });

            }

        }

    }

};

export { JACKPOT_CHANCE, MAX_JACKPOT, roll };
