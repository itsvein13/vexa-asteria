import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import roles from "../../config/roles.js";

export default {

    data: new SlashCommandBuilder()
        .setName("remove-initiate")
        .setDescription("Remove Initiate role from every member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild = interaction.guild;

        await guild.members.fetch();

        let removed = 0;
        let failed = 0;

        for (const member of guild.members.cache.values()) {

            if (!member.roles.cache.has(roles.INITIATE)) continue;

            try {
                await member.roles.remove(roles.INITIATE, "Vexa: /remove-initiate");
                removed++;
            } catch (error) {
                failed++;
                console.error(`remove-initiate gagal untuk ${member.user.tag}: ${error.message}`);
            }

        }

        await interaction.editReply({
            content: `✅ Role Initiate dilepas dari **${removed}** member.` +
                (failed ? ` (${failed} gagal — cek log)` : "")
        });

    }

};
