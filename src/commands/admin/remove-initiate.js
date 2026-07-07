import {
    SlashCommandBuilder,
    PermissionFlagsBits
} from "discord.js";

import roles from "../../config/roles.js";

export default {

    data: new SlashCommandBuilder()
        .setName("remove-initiate")
        .setDescription("Remove Initiate role from every member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        console.log("STEP 1");

        await interaction.deferReply({ ephemeral: true });

        console.log("STEP 2");

        const guild = interaction.guild;

        console.log("STEP 3");

        await guild.members.fetch();

        console.log("STEP 4");

        let removed = 0;

        for (const member of guild.members.cache.values()) {

            if (member.roles.cache.has(roles.INITIATE)) {

                console.log(`Removing ${member.user.tag}`);

                await member.roles.remove(roles.INITIATE);

                removed++;

            }

        }

        console.log("STEP 5");

        await interaction.editReply({
            content: `Removed ${removed}`
        });

    }

}