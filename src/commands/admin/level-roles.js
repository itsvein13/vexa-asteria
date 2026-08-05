import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getLevelRoles } from "../../database/levelRoles.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("level-roles")
        .setDescription("List the current level role ladder.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const ladder = getLevelRoles(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🪜 Level Role Ladder")
            .setDescription(
                ladder.length
                    ? ladder.map(r => `Level **${r.level}** → <@&${r.roleId}> (${r.label})`).join("\n")
                    : "Belum ada tangga level. Pakai `/level-roles-setup` atau `/level-role-add`."
            )
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
