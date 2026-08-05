import {
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import {
    getCreatorApplication,
    reviewCreatorApplication
} from "../../database/creatorApplications.js";

import COLORS from "../../config/colors.js";

export default {

    customId: "creator-reject",

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({
                content: "🔒 Kamu butuh izin Manage Roles untuk review aplikasi ini.",
                flags: MessageFlags.Ephemeral
            });
        }

        const userId = interaction.customId.split(":")[1];
        const app = getCreatorApplication(interaction.guild.id, userId);

        if (!app || app.status !== "pending") {
            return interaction.reply({
                content: "⚠️ Aplikasi ini sudah diproses sebelumnya.",
                flags: MessageFlags.Ephemeral
            });
        }

        const claimed = reviewCreatorApplication(
            interaction.guild.id, userId, "rejected", interaction.user.id
        );

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

        await interaction.update({ embeds: [updatedEmbed], components: [] });

        try {

            const member = await interaction.guild.members.fetch(userId);

            await member.send(
                "Aplikasi content creator kamu di Synd1cate belum bisa disetujui. " +
                "Kamu bisa apply lagi lewat menu role dengan link yang valid."
            ).catch(() => {});

        } catch {
            // Member sudah keluar server — cukup diamkan.
        }

    }

};
