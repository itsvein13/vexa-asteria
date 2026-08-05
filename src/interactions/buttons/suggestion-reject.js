import {
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getSuggestion, decideSuggestion } from "../../database/suggestions.js";
import COLORS from "../../config/colors.js";

export default {

    customId: "suggestion-reject",

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

        const claimed = decideSuggestion(interaction.guild.id, number, "rejected", interaction.user.id);

        if (!claimed) {
            return interaction.reply({
                content: "⚠️ Sudah diputuskan staff lain barusan.",
                flags: MessageFlags.Ephemeral
            });
        }

        const updatedEmbed = EmbedBuilder
            .from(interaction.message.embeds[0])
            .setColor(COLORS.danger)
            .addFields({ name: "Status", value: `❌ Ditolak oleh ${interaction.user}` });

        // Rejected = status akhir, ga ada aksi lanjutan — tombol dilepas.
        await interaction.update({ embeds: [updatedEmbed], components: [] });

        const submitter = await interaction.client.users.fetch(suggestion.userId).catch(() => null);

        if (submitter) {
            await submitter.send(
                `😔 Saran kamu **#${number}** di **${interaction.guild.name}** ditolak staff. Boleh diskusikan lebih lanjut kalau ada pertanyaan.`
            ).catch(() => {});
        }

    }

};
