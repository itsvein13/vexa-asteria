import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { addLevelRole } from "../../database/levelRoles.js";

export default {

    data: new SlashCommandBuilder()
        .setName("level-role-add")
        .setDescription("Create a new level reward role.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option
                .setName("level")
                .setDescription("Level required to earn this role.")
                .setMinValue(1)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("Role name.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("Hex color (e.g. #A855F7). Default: Vexa purple.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const level = interaction.options.getInteger("level");
        const name = interaction.options.getString("name");
        const color = interaction.options.getString("color") ?? "#A855F7";

        let role;

        try {

            role = await interaction.guild.roles.create({
                name,
                color,
                reason: `Vexa: /level-role-add oleh ${interaction.user.tag}`
            });

        } catch (error) {
            return interaction.reply({
                content: `❌ Gagal membuat role — ${error.message} (cek format warna & permission bot).`,
                flags: MessageFlags.Ephemeral
            });
        }

        const added = addLevelRole(interaction.guild.id, level, role.id, name);

        if (!added) {

            // Level sudah dipetakan sebelumnya — role SUDAH terlanjur dibuat,
            // jadi kasih tahu apa adanya daripada diam-diam menghapusnya.
            return interaction.reply({
                content: [
                    `⚠️ Level **${level}** sudah punya reward role sebelumnya.`,
                    `Role ${role} sudah dibuat tapi TIDAK didaftarkan — `,
                    `hapus manual atau pakai \`/level-role-remove\` dulu untuk level ini, lalu ulangi.`
                ].join(" "),
                flags: MessageFlags.Ephemeral
            });

        }

        await interaction.reply({
            content: `✅ Level **${level}** → ${role} terdaftar sebagai reward.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
