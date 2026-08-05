import { SlashCommandBuilder, MessageFlags } from "discord.js";

import { buildServiceCatalogEmbed } from "../../utils/serviceCatalog.js";

export default {

    data: new SlashCommandBuilder()
        .setName("services")
        .setDescription("See our service catalog and starting prices."),

    async execute(interaction) {

        const embed = buildServiceCatalogEmbed(interaction.guild.id);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
