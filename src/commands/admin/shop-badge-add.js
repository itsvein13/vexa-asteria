import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { getShopBadges, addShopBadge } from "../../database/shopBadges.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

/** Admin: tambah / update badge di katalog gacha. */
export default {

    data: new SlashCommandBuilder()
        .setName("shop-badge-add")
        .setDescription("Tambah badge ke katalog gacha.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o => o.setName("id").setDescription("ID unik badge (mis. neon).").setRequired(true))
        .addStringOption(o => o.setName("name").setDescription("Nama badge.").setRequired(true))
        .addStringOption(o => o.setName("emoji").setDescription("Emoji badge.").setRequired(true))
        .addIntegerOption(o => o.setName("price").setDescription("Harga / bobot tarik.").setRequired(true).setMinValue(1))
        .addStringOption(o => o.setName("description").setDescription("Deskripsi.").setRequired(false)),

    async execute(interaction) {

        const itemId = interaction.options.getString("id");
        const name = interaction.options.getString("name");
        const emoji = interaction.options.getString("emoji");
        const price = interaction.options.getInteger("price");
        const description = interaction.options.getString("description") ?? "";

        addShopBadge(interaction.guild.id, itemId, name, emoji, description, price);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`✅ Badge ${emoji} **${name}** ditambahkan ke gacha (💎 ${price.toLocaleString()}).`)
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
