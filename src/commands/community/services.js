import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

import { getAllServicePrices } from "../../database/servicePricing.js";
import TICKET_CATEGORIES from "../../config/ticketCategories.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

// Cuma kategori jasa berbayar (reviewable: true) yang tampil di sini —
// Complain dan General bukan jasa yang dijual, ga relevan buat price list.
const SERVICE_CATEGORIES = TICKET_CATEGORIES.filter(c => c.reviewable);

export default {

    data: new SlashCommandBuilder()
        .setName("services")
        .setDescription("See our service catalog and starting prices."),

    async execute(interaction) {

        const prices = getAllServicePrices(interaction.guild.id);

        const blocks = SERVICE_CATEGORIES.map(cat => {

            const info = prices[cat.id];

            const priceLine = info
                ? `💰 **${info.price}**`
                : "💰 Hubungi staff — buka tiket buat quote";

            const lines = [
                `${cat.emoji} **${cat.label}**`,
                `${cat.description}`,
                priceLine
            ];

            if (info?.note) {
                lines.push(`-# ${info.note}`);
            }

            return lines.join("\n");

        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🛍️ Service Catalog")
            .setDescription([
                "Jasa yang kita tawarin di Synd1cate, lengkap sama starting price-nya.",
                "",
                blocks.join("\n\n"),
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "Tertarik order? Buka tiket lewat tombol **Open Ticket** di channel ticket, pilih kategori yang sesuai."
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
