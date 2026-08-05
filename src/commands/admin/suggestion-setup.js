import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setSuggestionChannel } from "../../database/suggestions.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import safeSend from "../../utils/safeSend.js";

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

        // Panel penjelasan cara pakai — dikirim sekali ke channel-nya
        // biar member selalu punya rujukan (bukan cuma pengumuman
        // sekali lewat), pola sama dengan panel /ticket-setup.
        const panel = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("💡 Suggestion Box")
            .addFields(
                {
                    name: "🇮🇩 Bahasa Indonesia",
                    value: [
                        "Ada ide buat server ini? Sampaikan lewat `/suggest idea:<tulis di sini>`.",
                        "",
                        "Setiap saran otomatis dapat nomor urut dan diposting di channel ini — member lain bisa vote pakai reaksi 👍 / 👎, dan staff akan review lalu update statusnya: **Approved**, **Rejected**, atau **Implemented**.",
                        "",
                        "-# Tips: makin jelas & spesifik sarannya, makin gampang ditindaklanjuti staff."
                    ].join("\n")
                },
                {
                    name: "🇬🇧 English",
                    value: [
                        "Got an idea for this server? Share it with `/suggest idea:<your idea here>`.",
                        "",
                        "Every suggestion gets a number and is posted in this channel — other members can vote using 👍 / 👎 reactions, and staff will review it and update the status: **Approved**, **Rejected**, or **Implemented**.",
                        "",
                        "-# Tip: clear, specific suggestions are easier for staff to act on."
                    ].join("\n")
                }
            )
            .setFooter(EMBED_FOOTER);

        const panelSent = await safeSend(channel, { embeds: [panel] });

        await interaction.reply({
            content: [
                `✅ Suggestion box aktif — kiriman \`/suggest\` akan muncul di ${channel}.`,
                panelSent ? "" : "-# ⚠️ Panel penjelasan gagal dikirim (cek permission bot di channel itu) — command tetap aktif.",
                "",
                "-# Member vote lewat reaksi 👍👎, staff (izin **Manage Messages**) putuskan",
                "-# Approve/Reject lewat tombol, lalu tandai Implemented kalau sudah dikerjakan."
            ].filter(Boolean).join("\n"),
            flags: MessageFlags.Ephemeral
        });

    }

};
