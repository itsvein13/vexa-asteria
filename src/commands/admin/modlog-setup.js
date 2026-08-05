import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setModLogChannel } from "../../database/modLogConfig.js";

export default {

    data: new SlashCommandBuilder()
        .setName("modlog-setup")
        .setDescription("Set the channel where moderation action reports are sent.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("log")
                .setDescription("Channel that receives mod-log reports (warn/mute/kick/ban/etc).")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("log");

        setModLogChannel(interaction.guild.id, channel.id);

        await interaction.reply({
            content: [
                `✅ Mod-log akan dikirim ke ${channel}.`,
                "",
                "-# Semua aksi /warn, /mute, /kick, /ban, dst akan tercatat di sini",
                "-# lengkap dengan nomor case, jadi bisa ditelusuri lewat /case."
            ].join("\n"),
            flags: MessageFlags.Ephemeral
        });

    }

};
