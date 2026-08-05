import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setSuggestionChannel } from "../../database/suggestions.js";

export default {

    data: new SlashCommandBuilder()
        .setName("suggestion-setup")
        .setDescription("Set the channel where member suggestions are posted.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel that receives /suggest submissions.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");

        setSuggestionChannel(interaction.guild.id, channel.id);

        await interaction.reply({
            content: [
                `✅ Suggestion box aktif — kiriman \`/suggest\` akan muncul di ${channel}.`,
                "",
                "-# Member vote lewat reaksi 👍👎, staff (izin **Manage Messages**) putuskan",
                "-# Approve/Reject lewat tombol, lalu tandai Implemented kalau sudah dikerjakan."
            ].join("\n"),
            flags: MessageFlags.Ephemeral
        });

    }

};
