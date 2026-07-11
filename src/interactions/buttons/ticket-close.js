import {
    EmbedBuilder,
    AttachmentBuilder,
    MessageFlags
} from "discord.js";

import {
    getTicketConfig,
    getTicketByChannel,
    closeTicket
} from "../../database/tickets.js";

import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import safeSend from "../../utils/safeSend.js";

const TRANSCRIPT_LIMIT = 500; // batas pesan yang diarsipkan

/** Kumpulkan riwayat channel jadi teks transcript (urut lama → baru). */
async function buildTranscript(channel) {

    const collected = [];
    let cursor;

    while (collected.length < TRANSCRIPT_LIMIT) {

        const batch = await channel.messages.fetch({
            limit: 100,
            ...(cursor && { before: cursor })
        });

        if (batch.size === 0) break;

        collected.push(...batch.values());
        cursor = batch.last().id;

    }

    return collected
        .reverse()
        .map(msg => {

            const time = new Date(msg.createdTimestamp)
                .toISOString().replace("T", " ").slice(0, 19);

            const attachments = msg.attachments.size
                ? " " + [...msg.attachments.values()].map(a => `[file: ${a.url}]`).join(" ")
                : "";

            return `[${time}] ${msg.author.tag}: ${msg.content}${attachments}`;

        })
        .join("\n");

}

export default {

    customId: "ticket-close",

    async execute(interaction) {

        const guild = interaction.guild;
        const ticket = getTicketByChannel(guild.id, interaction.channel.id);

        if (!ticket) {
            return interaction.reply({
                content: "⚠️ Ini bukan channel tiket aktif.",
                flags: MessageFlags.Ephemeral
            });
        }

        const config = getTicketConfig(guild.id);

        // Hanya pembuat tiket atau staff yang boleh menutup
        const isOwner = interaction.user.id === ticket.userId;
        const isStaff = config && interaction.member.roles.cache.has(config.staffRoleId);

        if (!isOwner && !isStaff) {
            return interaction.reply({
                content: "🔒 Hanya pembuat tiket atau staff yang bisa menutup tiket ini.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: "🔒 Menutup tiket & menyimpan transcript..."
        });

        const numberTag = String(ticket.number).padStart(4, "0");

        // Transcript best-effort — kegagalan arsip tidak menghalangi penutupan
        let transcript = "";

        try {
            transcript = await buildTranscript(interaction.channel);
        } catch (error) {
            console.error(`Transcript tiket #${numberTag} gagal: ${error.message}`);
        }

        closeTicket(guild.id, interaction.channel.id, interaction.user.id);

        // Kirim ke channel log
        const logChannel = config
            ? guild.channels.cache.get(config.logChannelId)
            : null;

        if (logChannel) {

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle(`🎫 Ticket #${numberTag} ditutup`)
                .setDescription([
                    `Pembuat: <@${ticket.userId}>`,
                    `Ditutup oleh: ${interaction.user}`,
                    `Dibuka: <t:${Math.floor(ticket.createdAt / 1000)}:f>`
                ].join("\n"))
                .setFooter(EMBED_FOOTER)
                .setTimestamp();

            const files = transcript
                ? [new AttachmentBuilder(
                    Buffer.from(transcript, "utf8"),
                    { name: `ticket-${numberTag}.txt` }
                )]
                : [];

            await safeSend(logChannel, { embeds: [embed], files });

        }

        // Hapus channel setelah jeda singkat biar pesan penutup terbaca
        setTimeout(() => {
            interaction.channel.delete("Vexa: ticket closed").catch(() => {});
        }, 5000);

    }

};
