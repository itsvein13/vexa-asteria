import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { syncAllRewards } from "../../utils/syncAllRewards.js";
import { getLevelRoles } from "../../database/levelRoles.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("sync-rewards")
        .setDescription("Apply level role rewards to all eligible members (one-time sync).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild = interaction.guild;

        if (getLevelRoles(guild.id).length === 0) {
            return interaction.editReply({
                content: "⚠️ Server ini belum punya tangga level. Pakai `/level-roles-setup` atau `/level-role-add` dulu."
            });
        }

        const { eligible, granted, alreadyOk, left } = await syncAllRewards(guild);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🔄 Sync Rewards Selesai")
            .setDescription([
                `Member memenuhi syarat: **${eligible}**`,
                `🏅 Role baru diberikan: **${granted}**`,
                `✔️ Sudah sesuai: **${alreadyOk}**`,
                `👋 Sudah keluar server: **${left}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.editReply({ embeds: [embed] });

    }

};
