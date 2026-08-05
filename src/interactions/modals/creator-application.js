import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from "discord.js";

import {
    submitCreatorApplication,
    getCreatorReviewChannel
} from "../../database/creatorApplications.js";

import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import safeSend from "../../utils/safeSend.js";

export default {

    customId: "creator-application-modal",

    async execute(interaction) {

        const link = interaction.fields.getTextInputValue("link").trim();

        if (!/^https?:\/\//i.test(link)) {
            return interaction.reply({
                content: "⚠️ Link harus dimulai dengan `http://` atau `https://`. Buka lagi menu role dan coba sekali lagi.",
                flags: MessageFlags.Ephemeral
            });
        }

        submitCreatorApplication(interaction.guild.id, interaction.user.id, link);

        const channelId = getCreatorReviewChannel(interaction.guild.id);
        const reviewChannel = channelId
            ? interaction.guild.channels.cache.get(channelId)
            : null;

        if (!reviewChannel) {

            return interaction.reply({
                content: "⚠️ Aplikasimu tersimpan, tapi admin belum setup channel review (`/creator-review-setup`). Hubungi admin.",
                flags: MessageFlags.Ephemeral
            });

        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("📹 Aplikasi Content Creator")
            .setDescription([
                `Member: ${interaction.user} (\`${interaction.user.tag}\`)`,
                `Link: ${link}`
            ].join("\n"))
            .setFooter(EMBED_FOOTER)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`creator-approve:${interaction.user.id}`)
                .setLabel("Approve")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`creator-reject:${interaction.user.id}`)
                .setLabel("Reject")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)
        );

        const sent = await safeSend(reviewChannel, { embeds: [embed], components: [row] });

        await interaction.reply({
            content: sent
                ? "✅ Aplikasi kamu terkirim! Tunggu review dari staff ya."
                : "⚠️ Aplikasi tersimpan, tapi bot gagal kirim notifikasi ke staff (cek permission bot di channel review). Hubungi admin.",
            flags: MessageFlags.Ephemeral
        });

    }

};
