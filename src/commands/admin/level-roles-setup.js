import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import LEVEL_LADDER_PRESET from "../../config/levelLadderPreset.js";
import { levelRoleExists, addLevelRole } from "../../database/levelRoles.js";
import { syncAllRewards } from "../../utils/syncAllRewards.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("level-roles-setup")
        .setDescription("Create the default level role ladder (Rookie -> Legend).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild = interaction.guild;

        let created = 0;
        let skipped = 0;
        const lines = [];

        for (const tier of LEVEL_LADDER_PRESET) {

            // Idempotent — level yang sudah dipetakan dilewati, jadi
            // command ini aman dijalankan ulang (mis. lanjut setup
            // yang sempat gagal di tengah).
            if (levelRoleExists(guild.id, tier.level)) {
                skipped++;
                lines.push(`⏭️ Level ${tier.level} — sudah ada, dilewati.`);
                continue;
            }

            let role;

            try {

                role = await guild.roles.create({
                    name: `${tier.emoji} ${tier.label}`,
                    color: tier.color,
                    reason: "Vexa: /level-roles-setup"
                });

            } catch (error) {
                lines.push(`❌ Level ${tier.level} — gagal buat role: ${error.message}`);
                continue;
            }

            addLevelRole(guild.id, tier.level, role.id, tier.label);
            created++;
            lines.push(`✅ Level ${tier.level} — ${role}`);

        }

        // Auto-sync: member yang levelnya sudah cukup langsung dapat role,
        // tanpa admin perlu ingat menjalankan /sync-rewards terpisah.
        const { eligible, granted, alreadyOk, left } = await syncAllRewards(guild);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🪜 Level Roles Setup")
            .setDescription([
                lines.join("\n"),
                "",
                `**${created}** role dibuat, **${skipped}** dilewati.`,
                "",
                "**🔄 Auto-sync member existing**",
                `Memenuhi syarat: **${eligible}** • 🏅 role baru: **${granted}** • ✔️ sudah sesuai: **${alreadyOk}** • 👋 sudah keluar: **${left}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.editReply({ embeds: [embed] });

    }

};
