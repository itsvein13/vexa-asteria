import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

import { hasTestimonial } from "../../database/testimonials.js";

export default {

    customId: "testimonial-rate",

    // customId lengkap: "testimonial-rate:<guildId>:<ticketNumber>:<stars>".
    // Interaksi ini terjadi di DM (guild-nya udah gak ada di context),
    // makanya guildId dan ticketNumber di-embed di customId-nya sendiri.
    async execute(interaction) {

        const [, guildId, ticketNumberStr, starsStr] = interaction.customId.split(":");
        const ticketNumber = Number(ticketNumberStr);
        const stars = Number(starsStr);

        if (hasTestimonial(guildId, ticketNumber)) {
            return interaction.reply({
                content: "🙏 Kamu udah kasih review buat tiket ini sebelumnya. Makasih banyak!"
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`testimonial-modal:${guildId}:${ticketNumber}:${stars}`)
            .setTitle(`Review — ${"⭐".repeat(stars)}`)
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("content")
                        .setLabel("Testimoni / Review (opsional)")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("Ceritain pengalaman kamu... / Tell us about your experience...")
                        .setRequired(false)
                        .setMaxLength(500)
                )
            );

        await interaction.showModal(modal);

    }

};
