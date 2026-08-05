import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setTestimonialChannel } from "../../database/testimonials.js";

export default {

    data: new SlashCommandBuilder()
        .setName("testimonial-setup")
        .setDescription("Set the channel where client testimonials are posted.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel that receives client reviews/testimonials.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");

        setTestimonialChannel(interaction.guild.id, channel.id);

        await interaction.reply({
            content: [
                `✅ Testimonial channel diset ke ${channel}.`,
                "",
                "-# Begitu tiket kategori jasa (Design/Dev/Cinematic) ditutup, klien otomatis",
                "-# di-DM buat kasih rating ⭐ + testimoni. Hasilnya diposting ke channel ini."
            ].join("\n"),
            flags: MessageFlags.Ephemeral
        });

    }

};
