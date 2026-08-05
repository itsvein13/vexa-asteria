import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { canModerate, logModAction, dmModNotice } from "../../utils/modLog.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Issue a formal warning to a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to warn.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the warning.")
                .setRequired(true)
                .setMaxLength(300)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason");

        const targetMember = await interaction.guild.members.fetch(user.id).catch(() => null);

        const blocked = canModerate(interaction, user, targetMember);

        if (blocked) {
            await interaction.reply({ content: `❌ ${blocked}`, flags: MessageFlags.Ephemeral });
            return;
        }

        const { caseNumber, logged } = await logModAction(interaction.guild, {
            type: "warn",
            user,
            moderator: interaction.user,
            reason
        });

        const dmSent = await dmModNotice(user, interaction.guild, { type: "warn", reason });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `⚠️ ${user} telah diberi warning — **Case #${caseNumber}**.`,
                `Alasan: ${reason}`,
                dmSent ? "" : "-# DM ke member gagal terkirim (kemungkinan DM tertutup)."
            ].filter(Boolean).join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

        if (!logged) {
            await interaction.followUp({
                content: "-# ⚠️ Belum ada mod-log channel — jalankan `/modlog-setup` supaya case tercatat juga di sana. (Case tetap tersimpan di database.)",
                flags: MessageFlags.Ephemeral
            });
        }

    }

};
