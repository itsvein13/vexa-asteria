import { EmbedBuilder } from "discord.js";

import { getAllServicePrices } from "../database/servicePricing.js";
import {
    getServiceCatalogConfig,
    setServiceCatalogMessage
} from "../database/serviceCatalogConfig.js";
import TICKET_CATEGORIES from "../config/ticketCategories.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../config/constants.js";
import safeSend from "./safeSend.js";

// Cuma kategori jasa berbayar (reviewable: true) yang tampil — Complain
// dan General bukan jasa yang dijual, ga relevan buat price list.
const SERVICE_CATEGORIES = TICKET_CATEGORIES.filter(c => c.reviewable);

/** Bangun embed katalog jasa + harga terkini. Dipakai /services dan panel. */
export function buildServiceCatalogEmbed(guildId) {

    const prices = getAllServicePrices(guildId);

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

    return new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("🛍️ Service Catalog")
        .setDescription([
            "Jasa yang kita tawarin di Synd1cate, lengkap sama starting price-nya.",
            "",
            blocks.join("\n\n"),
            "",
            "━━━━━━━━━━━━━━━━━━━━",
            "Tertarik order? Buka tiket lewat tombol **Open Ticket** di channel ini, pilih kategori yang sesuai."
        ].join("\n"))
        .setFooter(EMBED_FOOTER);

}

/**
 * Refresh panel katalog yang udah di-post (kalau ada channel-nya di-config).
 * Edit pesan lama in-place; kalau ga ketemu/gagal, kirim pesan baru dan
 * simpen message_id-nya. Best-effort — ga pernah throw, biar caller
 * (/service-price-set, /service-price-remove, /services-setup) tetap
 * jalan mulus walau panel gagal ke-refresh (misal channel/pesan udah dihapus).
 */
export async function refreshServiceCatalogPanel(client, guildId) {

    try {

        const config = getServiceCatalogConfig(guildId);
        if (!config) return false;

        const channel = client.channels.cache.get(config.channelId)
            ?? await client.channels.fetch(config.channelId).catch(() => null);

        if (!channel) return false;

        const embed = buildServiceCatalogEmbed(guildId);

        if (config.messageId) {

            const existing = await channel.messages.fetch(config.messageId).catch(() => null);

            if (existing) {
                await existing.edit({ embeds: [embed] }).catch(() => null);
                return true;
            }

        }

        const sent = await safeSend(channel, { embeds: [embed] });

        if (sent) {
            setServiceCatalogMessage(guildId, sent.id);
            return true;
        }

        return false;

    } catch (error) {
        console.warn(`⚠️ refreshServiceCatalogPanel gagal: ${error.message}`);
        return false;
    }

}
