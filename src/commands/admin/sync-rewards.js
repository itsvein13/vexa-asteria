import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getAllLevels } from "../../database/levels.js";
import { rewardForLevel, syncRoleRewards } from "../../utils/roleRewards.js";
import LEVEL_ROLES from "../../config/levelRoles.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("sync-rewards")
        .setDescription("Apply level role rewards to all eligible members (one-time sync).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (LEVEL_ROLES.length === 0) {
            return interaction.editReply({
                content: "⚠️ Belum ada mapping di `config/levelRoles.js`."
            });
        }

        const guild = interaction.guild;
        const rows = getAllLevels(guild.id);

        // Cuma proses member yang levelnya sudah mencapai reward pertama
        const eligible = rows.filter(row => rewardForLevel(row.level) !== null);

        let granted = 0;
        let alreadyOk = 0;
        let left = 0;

        for (const row of eligible) {

            let member;

            try {
                member = await guild.members.fetch(row.userId);
            } catch {
                left++; // sudah keluar server / tidak ditemukan
                continue;
            }

            const reward = await syncRoleRewards(member, row.level);

            if (reward) granted++;
            else alreadyOk++;

        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🔄 Sync Rewards Selesai")
            .setDescription([
                `Member memenuhi syarat: **${eligible.length}**`,
                `🏅 Role baru diberikan: **${granted}**`,
                `✔️ Sudah sesuai: **${alreadyOk}**`,
                `👋 Sudah keluar server: **${left}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.editReply({ embeds: [embed] });

    }

};
