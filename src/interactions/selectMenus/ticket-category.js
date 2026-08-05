import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits
} from "discord.js";

import {
    getTicketConfig,
    getOpenTicket,
    createTicket
} from "../../database/tickets.js";

import { getTicketCategory } from "../../config/ticketCategories.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    customId: "ticket-category-select",

    async execute(interaction) {

        const guild = interaction.guild;
        const config = getTicketConfig(guild.id);

        if (!config) {
            return interaction.update({
                content: "⚠️ Ticket system belum dikonfigurasi. Hubungi admin.",
                components: []
            });
        }

        // Guard ulang — jaga-jaga kalau user buka dua select menu / klik
        // dobel sebelum yang pertama selesai diproses.
        const existing = getOpenTicket(guild.id, interaction.user.id);

        if (existing) {
            return interaction.update({
                content: `⚠️ Kamu masih punya tiket aktif: <#${existing.channelId}>`,
                components: []
            });
        }

        const category = getTicketCategory(interaction.values[0]);

        await interaction.deferUpdate();

        let channel;

        try {

            channel = await guild.channels.create({
                name: `ticket-${interaction.user.username}`.slice(0, 90),
                type: ChannelType.GuildText,
                parent: config.categoryId,
                topic: category ? `${category.emoji} ${category.label} — dibuka oleh ${interaction.user.tag}` : undefined,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: config.staffRoleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.members.me.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ]
            });

        } catch (error) {
            console.error("Gagal membuat channel tiket:", error.message);
            return interaction.editReply({
                content: "❌ Gagal membuat tiket — cek permission bot (Manage Channels) & kategori.",
                components: []
            });
        }

        const { number } = createTicket(guild.id, interaction.user.id, channel.id, category?.id ?? null);

        // Rename dengan nomor urut (best-effort, nama username tetap ok kalau gagal)
        await channel.setName(`ticket-${String(number).padStart(4, "0")}`).catch(() => {});

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`🎫 Ticket #${String(number).padStart(4, "0")}`)
            .setDescription([
                `Halo ${interaction.user}! Jelaskan keperluanmu di sini.`,
                category ? `Kategori: **${category.emoji} ${category.label}**` : "",
                `Tim <@&${config.staffRoleId}> akan segera merespons.`,
                "",
                "-# Staff atau kamu bisa menutup tiket dengan tombol di bawah."
            ].filter(Boolean).join("\n"))
            .setFooter(EMBED_FOOTER);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket-close")
                .setLabel("Close Ticket")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `${interaction.user} <@&${config.staffRoleId}>`,
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply({
            content: `✅ Tiket kamu dibuat: ${channel}`,
            components: []
        });

    }

};
