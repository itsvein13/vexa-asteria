import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

import { getTicketConfig, getTicketByChannel, setOrderStatus } from "../../database/tickets.js";
import TICKET_ORDER_STATUSES, { getOrderStatus } from "../../config/ticketOrderStatuses.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";

export default {

    data: new SlashCommandBuilder()
        .setName("ticket-status")
        .setDescription("Update this ticket's progress status (staff only).")
        .addStringOption(option =>
            option
                .setName("status")
                .setDescription("New status for this ticket.")
                .setRequired(true)
                .addChoices(
                    ...TICKET_ORDER_STATUSES.map(s => ({ name: `${s.emoji} ${s.label}`, value: s.id })),
                    { name: "↩️ Reset (belum diproses)", value: "none" }
                )
        ),

    async execute(interaction) {

        // Cuma masuk akal dijalankan di dalam channel tiket yang masih aktif
        // — bukan command global, jadi ga di-gate PermissionFlagsBits (role
        // staff-nya server-specific/configurable, dicek manual di bawah,
        // pola sama kayak ticket-close.js).
        const ticket = getTicketByChannel(interaction.guild.id, interaction.channel.id);

        if (!ticket) {
            await interaction.reply({
                content: "⚠️ Command ini cuma bisa dipakai di dalam channel tiket yang masih aktif.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const config = getTicketConfig(interaction.guild.id);
        const isStaff = config && interaction.member.roles.cache.has(config.staffRoleId);

        if (!isStaff) {
            await interaction.reply({
                content: "🔒 Cuma staff yang bisa update status tiket.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const statusId = interaction.options.getString("status");
        const isReset = statusId === "none";

        const updated = setOrderStatus(interaction.guild.id, interaction.channel.id, isReset ? null : statusId);

        if (!updated) {
            await interaction.reply({
                content: "⚠️ Gagal update — tiket ini mungkin sudah ditutup.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const status = isReset ? null : getOrderStatus(statusId);
        const numberTag = String(ticket.number).padStart(4, "0");

        // Best-effort: selipin status ke topic channel biar keliatan tanpa
        // buka chat. Ini setTopic, BUKAN setName — rename channel ada rate
        // limit ketat (2x/10menit) yang udah pernah kena di Lofi clock,
        // topic ga masalah dipakai berkali-kali.
        await interaction.channel.setTopic(
            status
                ? `${status.emoji} ${status.label} — Ticket #${numberTag}`
                : `Ticket #${numberTag}`
        ).catch(() => {});

        const embed = new EmbedBuilder()
            .setColor(status ? COLORS.gold : EMBED_COLOR)
            .setDescription([
                `📌 Status tiket diupdate: **${status ? `${status.emoji} ${status.label}` : "Reset (belum diproses)"}**`,
                `oleh ${interaction.user}`
            ].join("\n"))
            .setFooter(EMBED_FOOTER)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

    }

};
