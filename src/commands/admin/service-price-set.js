import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setServicePrice } from "../../database/servicePricing.js";
import { getTicketCategory } from "../../config/ticketCategories.js";
import { refreshServiceCatalogPanel } from "../../utils/serviceCatalog.js";

// Cuma kategori jasa berbayar (reviewable: true) yang masuk akal dipatok
// harga — Complain dan General bukan jasa yang dijual.
const SERVICE_CHOICES = [
    { name: "🎨 Design & Video Editing", value: "design" },
    { name: "💻 Web & App Development", value: "programming" },
    { name: "🎬 FiveM & NFS Cinematic", value: "cinematic" }
];

export default {

    data: new SlashCommandBuilder()
        .setName("service-price-set")
        .setDescription("Set or update the starting price for a service category.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("category")
                .setDescription("Which service category.")
                .setRequired(true)
                .addChoices(...SERVICE_CHOICES)
        )
        .addStringOption(option =>
            option
                .setName("price")
                .setDescription("e.g. 'Mulai Rp150.000' or 'Nego'.")
                .setRequired(true)
                .setMaxLength(100)
        )
        .addStringOption(option =>
            option
                .setName("note")
                .setDescription("Optional extra info (e.g. 'Termasuk 2x revisi').")
                .setRequired(false)
                .setMaxLength(200)
        ),

    async execute(interaction) {

        const categoryId = interaction.options.getString("category");
        const price = interaction.options.getString("price");
        const note = interaction.options.getString("note");

        setServicePrice(interaction.guild.id, categoryId, price, note);

        await refreshServiceCatalogPanel(interaction.client, interaction.guild.id);

        const category = getTicketCategory(categoryId);

        await interaction.reply({
            content: `✅ Harga **${category.emoji} ${category.label}** diset ke **${price}**${note ? ` — _${note}_` : ""}. Cek hasilnya lewat \`/services\`.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
