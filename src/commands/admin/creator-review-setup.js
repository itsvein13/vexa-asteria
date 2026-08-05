import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setCreatorReviewChannel } from "../../database/creatorApplications.js";

export default {

    data: new SlashCommandBuilder()
        .setName("creator-review-setup")
        .setDescription("Set the channel where content creator applications are reviewed.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel that receives creator verification applications.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");

        setCreatorReviewChannel(interaction.guild.id, channel.id);

        await interaction.reply({
            content: `✅ Aplikasi content creator sekarang direview di ${channel}.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
