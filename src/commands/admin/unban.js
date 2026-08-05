import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { canModerate, logModAction } from "../../utils/modLog.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

const SNOWFLAKE = /^\d{17,20}$/;

export default {

    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user by their ID.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option
                .setName("user_id")
                .setDescription("The banned user's ID (right-click a name > Copy User ID with Dev Mode on).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the unban.")
                .setMaxLength(300)
        ),

    async execute(interaction) {

        const userId = interaction.options.getString("user_id").trim();
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        if (!SNOWFLAKE.test(userId)) {
            await interaction.reply({
                content: "❌ Itu bukan User ID yang valid. Aktifkan Developer Mode lalu klik kanan user > Copy User ID.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const banEntry = await interaction.guild.bans.fetch(userId).catch(() => null);

        if (!banEntry) {
            await interaction.reply({ content: "❌ User ini tidak ada di ban list.", flags: MessageFlags.Ephemeral });
            return;
        }

        const blocked = canModerate(interaction, banEntry.user, null);

        if (blocked) {
            await interaction.reply({ content: `❌ ${blocked}`, flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await interaction.guild.members.unban(userId, reason);
        } catch (error) {
            await interaction.reply({
                content: `❌ Gagal unban: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const { caseNumber, logged } = await logModAction(interaction.guild, {
            type: "unban",
            user: banEntry.user,
            moderator: interaction.user,
            reason
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `🕊️ ${banEntry.user.tag} telah di-unban — **Case #${caseNumber}**.`,
                `Alasan: ${reason}`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

        if (!logged) {
            await interaction.followUp({
                content: "-# ⚠️ Belum ada mod-log channel — jalankan `/modlog-setup` supaya case tercatat juga di sana.",
                flags: MessageFlags.Ephemeral
            });
        }

    }

};
