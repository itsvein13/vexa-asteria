import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getActiveWarnings } from "../../database/modCases.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("List a member's active warnings.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to check.")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const warnings = getActiveWarnings(interaction.guild.id, user.id);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`⚠️ Warnings — ${user.tag}`)
            .setFooter(EMBED_FOOTER);

        if (!warnings.length) {

            embed.setDescription("Tidak ada warning aktif.");

        } else {

            embed.setDescription(
                warnings.map(w => [
                    `**Case #${w.caseNumber}** — <t:${Math.floor(w.createdAt / 1000)}:R>`,
                    `Alasan: ${w.reason}`,
                    `Moderator: <@${w.moderatorId}>`
                ].join("\n")).join("\n\n")
            );

        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
