import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setTicketConfig } from "../../database/tickets.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("ticket-setup")
        .setDescription("Configure the ticket system and send the ticket panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option
                .setName("staff")
                .setDescription("Role that can see & handle tickets.")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("category")
                .setDescription("Category where ticket channels are created.")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("log")
                .setDescription("Channel that receives transcripts of closed tickets.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const staff = interaction.options.getRole("staff");
        const category = interaction.options.getChannel("category");
        const log = interaction.options.getChannel("log");

        setTicketConfig(interaction.guild.id, {
            staffRoleId: staff.id,
            categoryId: category.id,
            logChannelId: log.id
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎫 Support Ticket")
            .setDescription([
                "Butuh bantuan admin/staff secara privat?",
                "Klik tombol di bawah — kamu akan mendapat channel privat",
                "yang hanya bisa dilihat kamu dan tim staff.",
                "",
                "-# Satu member hanya bisa punya satu tiket aktif."
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket-open")
                .setLabel("Open Ticket")
                .setEmoji("🎫")
                .setStyle(ButtonStyle.Primary)
        );

        // Panel dikirim ke channel tempat command dijalankan
        await interaction.channel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: `✅ Ticket system aktif — staff: ${staff}, kategori: **${category.name}**, log: ${log}.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
