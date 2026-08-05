import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setAutomodLogChannel } from "../../database/automodConfig.js";

export default {

    data: new SlashCommandBuilder()
        .setName("automod-setup")
        .setDescription("Set the channel where AutoMod spam reports are sent.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("log")
                .setDescription("Channel that receives spam detection reports.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("log");

        setAutomodLogChannel(interaction.guild.id, channel.id);

        await interaction.reply({
            content: [
                `✅ Laporan AutoMod akan dikirim ke ${channel}.`,
                "",
                "-# Pastikan bot punya izin **Manage Messages** dan **Ban Members**",
                "-# supaya bisa hapus pesan spam + ban otomatis."
            ].join("\n"),
            flags: MessageFlags.Ephemeral
        });

    }

};
