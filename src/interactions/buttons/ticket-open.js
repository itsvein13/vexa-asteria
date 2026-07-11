import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import {
    getTicketConfig,
    getOpenTicket,
    createTicket
} from "../../database/tickets.js";

import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

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

        // Satu tiket aktif per member
        const existing = getOpenTicket(guild.id, interaction.user.id);

        if (existing) {
            return interaction.reply({
                content: `⚠️ Kamu masih punya tiket aktif: <#${existing.channelId}>`,
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let channel;

        try {

            channel = await guild.channels.create({
                name: `ticket-${interaction.user.username}`.slice(0, 90),
                type: ChannelType.GuildText,
                parent: config.categoryId,
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
                content: "❌ Gagal membuat tiket — cek permission bot (Manage Channels) & kategori."
            });
        }

        const { number } = createTicket(guild.id, interaction.user.id, channel.id);

        // Rename dengan nomor urut (best-effort, nama username tetap ok kalau gagal)
        await channel.setName(`ticket-${String(number).padStart(4, "0")}`).catch(() => {});

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`🎫 Ticket #${String(number).padStart(4, "0")}`)
            .setDescription([
                `Halo ${interaction.user}! Jelaskan keperluanmu di sini.`,
                `Tim <@&${config.staffRoleId}> akan segera merespons.`,
                "",
                "-# Staff atau kamu bisa menutup tiket dengan tombol di bawah."
            ].join("\n"))
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
            content: `✅ Tiket kamu dibuat: ${channel}`
        });

    }

};
