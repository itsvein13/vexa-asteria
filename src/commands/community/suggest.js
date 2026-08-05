import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from "discord.js";

import { createSuggestion, attachSuggestionMessage, getSuggestionChannel } from "../../database/suggestions.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import safeSend from "../../utils/safeSend.js";

export default {

    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Submit a suggestion for the server.")
        .addStringOption(option =>
            option
                .setName("idea")
                .setDescription("Your suggestion.")
                .setRequired(true)
                .setMaxLength(500)
        ),

    async execute(interaction) {

        const content = interaction.options.getString("idea");

        const channelId = getSuggestionChannel(interaction.guild.id);
        const channel = channelId ? interaction.guild.channels.cache.get(channelId) : null;

        if (!channel) {
            await interaction.reply({
                content: "⚠️ Suggestion box belum di-setup admin (`/suggestion-setup`). Hubungi admin dulu ya.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { number } = createSuggestion(interaction.guild.id, interaction.user.id, content);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`💡 Suggestion #${number}`)
            .setDescription(content)
            .addFields({ name: "Diusulkan oleh", value: `${interaction.user}`, inline: true })
            .setFooter(EMBED_FOOTER)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`suggestion-approve:${number}`)
                .setLabel("Approve")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`suggestion-reject:${number}`)
                .setLabel("Reject")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)
        );

        const sent = await safeSend(channel, { embeds: [embed], components: [row] });

        if (!sent) {
            await interaction.reply({
                content: "⚠️ Saran kamu tersimpan, tapi bot gagal kirim ke channel suggestion (cek permission bot). Hubungi admin.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        attachSuggestionMessage(interaction.guild.id, number, sent.id);

        // Reaksi vote buat komunitas — best-effort, gagal react ga boleh
        // bikin command ini error (misal bot kehilangan izin Add Reactions).
        await sent.react("👍").catch(() => {});
        await sent.react("👎").catch(() => {});

        await interaction.reply({
            content: `✅ Saran kamu terkirim sebagai **#${number}** di ${channel}!`,
            flags: MessageFlags.Ephemeral
        });

    }

};
