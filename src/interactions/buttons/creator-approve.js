import {
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import {
    getCreatorApplication,
    reviewCreatorApplication
} from "../../database/creatorApplications.js";

import roles from "../../config/roles.js";
import COLORS from "../../config/colors.js";

export default {

    customId: "creator-approve",

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

        // Guard atomik — kalau staff lain barusan klik duluan, jangan dobel proses.
        const claimed = reviewCreatorApplication(
            interaction.guild.id, userId, "approved", interaction.user.id
        );

        if (!claimed) {
            return interaction.reply({
                content: "⚠️ Sudah diputuskan staff lain barusan.",
                flags: MessageFlags.Ephemeral
            });
        }

        let member = null;
        let roleAssigned = false;

        try {

            member = await interaction.guild.members.fetch(userId);
            await member.roles.remove(roles.HUMAN_BEING).catch(() => {});
            await member.roles.add(roles.STREAMER);
            roleAssigned = true;

        } catch (error) {
            console.error(`creator-approve gagal assign role ke ${userId}: ${error.message}`);
        }

        const statusLine = roleAssigned
            ? `✅ Disetujui oleh ${interaction.user} — role Streamer diberikan.`
            : `⚠️ Disetujui oleh ${interaction.user}, TAPI gagal kasih role (member keluar server / permission bot). Cek manual.`;

        const updatedEmbed = EmbedBuilder
            .from(interaction.message.embeds[0])
            .setColor(roleAssigned ? COLORS.success : COLORS.danger)
            .addFields({ name: "Status", value: statusLine });

        await interaction.update({ embeds: [updatedEmbed], components: [] });

        if (member) {
            await member.send(
                "🎉 Aplikasi content creator kamu di Synd1cate **disetujui**! Role Streamer sudah aktif."
            ).catch(() => {}); // DM tertutup — abaikan, bukan kesalahan fatal
        }

    }

};
