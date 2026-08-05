import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { removeServicePrice } from "../../database/servicePricing.js";
import { getTicketCategory } from "../../config/ticketCategories.js";

const SERVICE_CHOICES = [
    { name: "🎨 Design & Video Editing", value: "design" },
    { name: "💻 Web & App Development", value: "programming" },
    { name: "🎬 FiveM & NFS Cinematic", value: "cinematic" }
];

export default {

    data: new SlashCommandBuilder()
        .setName("service-price-remove")
        .setDescription("Remove the price set for a service category.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("category")
                .setDescription("Which service category.")
                .setRequired(true)
                .addChoices(...SERVICE_CHOICES)
        ),

    async execute(interaction) {

        const categoryId = interaction.options.getString("category");
        const category = getTicketCategory(categoryId);

        const removed = removeServicePrice(interaction.guild.id, categoryId);

        await interaction.reply({
            content: removed
                ? `✅ Harga **${category.emoji} ${category.label}** dihapus. Kategori ini bakal tampil sebagai "hubungi staff" di \`/services\`.`
                : `⚠️ **${category.emoji} ${category.label}** belum punya harga yang diset.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
