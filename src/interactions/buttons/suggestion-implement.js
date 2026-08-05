import {
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getSuggestion, implementSuggestion } from "../../database/suggestions.js";
import COLORS from "../../config/colors.js";

export default {

    customId: "suggestion-implement",

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "🔒 Kamu butuh izin Manage Messages untuk review suggestion ini.",
                flags: MessageFlags.Ephemeral
            });
        }

        const number = Number(interaction.customId.split(":")[1]);
        const suggestion = getSuggestion(interaction.guild.id, number);

        if (!suggestion || suggestion.status !== "approved") {
            return interaction.reply({
                content: "⚠️ Suggestion ini belum di-approve atau sudah ditandai implemented.",
                flags: MessageFlags.Ephemeral
            });
        }

        const claimed = implementSuggestion(interaction.guild.id, number, interaction.user.id);

        if (!claimed) {
            return interaction.reply({
                content: "⚠️ Sudah diproses staff lain barusan.",
                flags: MessageFlags.Ephemeral
            });
        }

        const updatedEmbed = EmbedBuilder
            .from(interaction.message.embeds[0])
            .setColor(COLORS.gold)
            .addFields({ name: "Status", value: `🚀 Diimplementasikan oleh ${interaction.user}` });

        await interaction.update({ embeds: [updatedEmbed], components: [] });

        const submitter = await interaction.client.users.fetch(suggestion.userId).catch(() => null);

        if (submitter) {
            await submitter.send(
                `🚀 Saran kamu **#${number}** di **${interaction.guild.name}** sudah diimplementasikan! Terima kasih idenya.`
            ).catch(() => {});
        }

    }

};
