import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

import { getTicketsByUser, getTicketConfig } from "../../database/tickets.js";
import { getTicketCategory } from "../../config/ticketCategories.js";
import { getOrderStatus } from "../../config/ticketOrderStatuses.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("my-orders")
        .setDescription("View your (or a member's) ticket order history.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Check someone else's history (staff only).")
        ),

    async execute(interaction) {

        const target = interaction.options.getUser("member") ?? interaction.user;
        const isSelf = target.id === interaction.user.id;

        if (!isSelf) {

            const config = getTicketConfig(interaction.guild.id);
            const isStaff = config && interaction.member.roles.cache.has(config.staffRoleId);

            if (!isStaff) {
                await interaction.reply({
                    content: "🔒 Cuma staff yang bisa lihat histori order member lain.",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

        }

        const tickets = getTicketsByUser(interaction.guild.id, target.id, 10);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`🎫 Order History — ${target.tag}`)
            .setFooter(EMBED_FOOTER);

        if (!tickets.length) {

            embed.setDescription("Belum ada tiket yang pernah dibuka.");

        } else {

            const lines = tickets.map(t => {

                const numberTag = String(t.number).padStart(4, "0");
                const category = t.category ? getTicketCategory(t.category) : null;
                const categoryLabel = category ? `${category.emoji} ${category.label}` : "Tanpa kategori";

                const statusLine = t.status === "open"
                    ? (() => {
                        const order = t.orderStatus ? getOrderStatus(t.orderStatus) : null;
                        return `🟢 Terbuka${order ? ` — ${order.emoji} ${order.label}` : ""} <t:${Math.floor(t.createdAt / 1000)}:R>`;
                    })()
                    : `⚫ Ditutup <t:${Math.floor((t.closedAt ?? t.createdAt) / 1000)}:R>${t.rating ? ` — ${"⭐".repeat(t.rating)}` : ""}`;

                return `**#${numberTag}** — ${categoryLabel}\n${statusLine}`;

            });

            if (tickets.length === 10) {
                lines.push("-# Cuma 10 tiket terbaru yang ditampilkan.");
            }

            embed.setDescription(lines.join("\n\n"));

        }

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

    }

};
