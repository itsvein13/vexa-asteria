import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getSuggestion, decideSuggestion } from "../../database/suggestions.js";
import COLORS from "../../config/colors.js";

export default {

    customId: "suggestion-approve",

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "🔒 Kamu butuh izin Manage Messages untuk review suggestion ini.",
                flags: MessageFlags.Ephemeral
            });
        }

        const number = Number(interaction.customId.split(":")[1]);
        const suggestion = getSuggestion(interaction.guild.id, number);

        if (!suggestion || suggestion.status !== "pending") {
            return interaction.reply({
                content: "⚠️ Suggestion ini sudah diproses sebelumnya.",
                flags: MessageFlags.Ephemeral
            });
        }

        // Guard atomik — anti dobel-proses kalau dua staff klik bersamaan.
        const claimed = decideSuggestion(interaction.guild.id, number, "approved", interaction.user.id);

        if (!claimed) {
            return interaction.reply({
                content: "⚠️ Sudah diputuskan staff lain barusan.",
                flags: MessageFlags.Ephemeral
            });
        }

        const updatedEmbed = EmbedBuilder
            .from(interaction.message.embeds[0])
            .setColor(COLORS.success)
            .addFields({ name: "Status", value: `✅ Disetujui oleh ${interaction.user}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`suggestion-implement:${number}`)
                .setLabel("Mark Implemented")
                .setEmoji("🚀")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ embeds: [updatedEmbed], components: [row] });

        const submitter = await interaction.client.users.fetch(suggestion.userId).catch(() => null);

        if (submitter) {
            await submitter.send(
                `🎉 Saran kamu **#${number}** di **${interaction.guild.name}** disetujui staff!`
            ).catch(() => {});
        }

    }

};
