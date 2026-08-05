import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags
} from "discord.js";

import roles from "../../config/roles.js";
import { getCreatorApplication } from "../../database/creatorApplications.js";

export default {

    customId: "streamer-role-menu",

    async execute(interaction) {

        const member = interaction.member;
        const selected = interaction.values[0];

        // "Just here to hang out" — langsung, ga perlu verifikasi apa-apa.
        if (selected === "human") {

            await member.roles.remove([roles.STREAMER, roles.HUMAN_BEING]);
            await member.roles.add(roles.HUMAN_BEING);

            return interaction.reply({
                content: "🎥 Your streamer status has been updated!",
                flags: MessageFlags.Ephemeral
            });

        }

        // selected === "streamer" — ga langsung dikasih role, harus verifikasi
        // link dulu (jaga-jaga dari klaim asal-asalan).

        if (member.roles.cache.has(roles.STREAMER)) {
            return interaction.reply({
                content: "✅ Kamu sudah terverifikasi sebagai content creator.",
                flags: MessageFlags.Ephemeral
            });
        }

        const existing = getCreatorApplication(interaction.guild.id, interaction.user.id);

        if (existing?.status === "pending") {
            return interaction.reply({
                content: "⏳ Aplikasimu masih menunggu review staff. Sabar ya!",
                flags: MessageFlags.Ephemeral
            });
        }

        // Modal minta link — showModal HARUS jadi respons pertama interaction ini.
        const modal = new ModalBuilder()
            .setCustomId("creator-application-modal")
            .setTitle("Content Creator Verification");

        const linkInput = new TextInputBuilder()
            .setCustomId("link")
            .setLabel("Kirim Link Akun Content Creator Mu")
            .setPlaceholder("https://youtube.com/@kamu atau https://Tiktok.com/kamu")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(300);

        modal.addComponents(new ActionRowBuilder().addComponents(linkInput));

        await interaction.showModal(modal);

    }

}
