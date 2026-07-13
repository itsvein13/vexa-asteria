import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setClockChannel, clockChannelName } from "../../utils/clockChannel.js";

export default {

    data: new SlashCommandBuilder()
        .setName("lofi-setup")
        .setDescription("Create/register the Lofi Radio voice channel with a live WIB clock.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("label")
                .setDescription("Channel label (default: Lofi Radio).")
                .setRequired(false)
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Existing voice channel to use (leave empty to create a new one).")
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(false)
        )
        .addChannelOption(option =>
            option
                .setName("category")
                .setDescription("Category for the new channel (when creating).")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false)
        ),

    async execute(interaction) {

        const label = interaction.options.getString("label") ?? "Lofi Radio";
        let channel = interaction.options.getChannel("channel");
        const category = interaction.options.getChannel("category");

        // Tanpa channel → buatkan voice channel baru
        if (!channel) {

            try {

                channel = await interaction.guild.channels.create({
                    name: clockChannelName(label),
                    type: ChannelType.GuildVoice,
                    ...(category && { parent: category.id })
                });

            } catch (error) {
                console.error("lofi-setup gagal buat channel:", error.message);
                return interaction.reply({
                    content: "❌ Gagal membuat voice channel — cek permission bot (Manage Channels).",
                    flags: MessageFlags.Ephemeral
                });
            }

        } else {
            // Channel existing → langsung rename ke format jam
            await channel.setName(clockChannelName(label)).catch(() => {});
        }

        setClockChannel(interaction.guild.id, channel.id, label);

        await interaction.reply({
            content: [
                `✅ Voice clock aktif: ${channel}`,
                `Jam WIB di nama channel di-update tiap **5 menit** (batas rename Discord).`,
                `Tinggal invite bot Lofi Radio-mu dan set dia join channel ini 24/7.`
            ].join("\n"),
            flags: MessageFlags.Ephemeral
        });

    }

};
