import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} from "discord.js";

import { getTicketConfig, getOpenTicket } from "../../database/tickets.js";
import TICKET_CATEGORIES from "../../config/ticketCategories.js";

export default {

    customId: "ticket-open",

    async execute(interaction) {

        const guild = interaction.guild;
        const config = getTicketConfig(guild.id);

        if (!config) {
            return interaction.reply({
                content: "⚠️ Ticket system belum dikonfigurasi. Hubungi admin.",
                flags: MessageFlags.Ephemeral
            });
        }

        // Satu tiket aktif per member — dicek di sini juga (bukan cuma
        // di langkah select kategori) biar user langsung tau tanpa
        // perlu milih kategori dulu.
        const existing = getOpenTicket(guild.id, interaction.user.id);

        if (existing) {
            return interaction.reply({
                content: `⚠️ Kamu masih punya tiket aktif: <#${existing.channelId}>`,
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("ticket-category-select")
                .setPlaceholder("Pilih kategori kebutuhan kamu...")
                .addOptions(TICKET_CATEGORIES.map(c => ({
                    label: c.label,
                    description: c.description,
                    value: c.id,
                    emoji: c.emoji
                })))
        );

        await interaction.reply({
            content: "🎫 Sebelum tiket dibuat, pilih dulu kategori yang paling sesuai sama kebutuhan kamu:",
            components: [row],
            flags: MessageFlags.Ephemeral
        });

    }

};
