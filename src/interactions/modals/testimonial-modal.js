import { EmbedBuilder } from "discord.js";

import { saveTestimonial, getTestimonialChannel } from "../../database/testimonials.js";
import { getTicketByNumber } from "../../database/tickets.js";
import { getTicketCategory } from "../../config/ticketCategories.js";
import { EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";
import safeSend from "../../utils/safeSend.js";

export default {

    customId: "testimonial-modal",

    // customId lengkap: "testimonial-modal:<guildId>:<ticketNumber>:<stars>".
    async execute(interaction) {

        const [, guildId, ticketNumberStr, starsStr] = interaction.customId.split(":");
        const ticketNumber = Number(ticketNumberStr);
        const stars = Number(starsStr);
        const content = interaction.fields.getTextInputValue("content").trim();

        const ticket = getTicketByNumber(guildId, ticketNumber);
        const category = ticket?.category ? getTicketCategory(ticket.category) : null;

        const saved = saveTestimonial(
            guildId, ticketNumber, interaction.user.id,
            ticket?.category ?? null, stars, content
        );

        if (!saved) {
            return interaction.reply({
                content: "🙏 Kamu udah kasih review buat tiket ini sebelumnya. Makasih banyak!"
            });
        }

        const guild = interaction.client.guilds.cache.get(guildId);
        const channelId = guild ? getTestimonialChannel(guildId) : null;
        const channel = channelId ? guild.channels.cache.get(channelId) : null;

        if (channel) {

            const fields = [];

            if (category) {
                fields.push({ name: "Kategori Jasa", value: `${category.emoji} ${category.label}`, inline: true });
            }

            fields.push({ name: "Ticket", value: `#${String(ticketNumber).padStart(4, "0")}`, inline: true });

            const embed = new EmbedBuilder()
                .setColor(COLORS.gold)
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTitle("⭐".repeat(stars) + "☆".repeat(5 - stars))
                .setDescription(content || "*(tanpa komentar tertulis / no written comment)*")
                .addFields(fields)
                .setFooter(EMBED_FOOTER)
                .setTimestamp();

            await safeSend(channel, { embeds: [embed] });

        }

        await interaction.reply({
            content: "🙏 Makasih banyak atas review-nya! Sukses selalu buat kita bareng-bareng. / Thank you so much for the review!"
        });

    }

};
