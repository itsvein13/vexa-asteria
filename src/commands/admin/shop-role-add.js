import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { getShopRoles, addShopRole } from "../../database/shopRoles.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

/** Admin: tambah role yang bisa dibeli pakai Shards. */
export default {

    data: new SlashCommandBuilder()
        .setName("shop-role-add")
        .setDescription("Tambah role yang bisa dibeli member pakai Shards.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o => o.setName("id").setDescription("ID unik (mis. vip).").setRequired(true))
        .addRoleOption(o => o.setName("role").setDescription("Role yang dijual.").setRequired(true))
        .addStringOption(o => o.setName("name").setDescription("Nama tampil.").setRequired(true))
        .addIntegerOption(o => o.setName("price").setDescription("Harga Shards.").setRequired(true).setMinValue(1))
        .addStringOption(o => o.setName("description").setDescription("Deskripsi.").setRequired(false)),

    async execute(interaction) {

        const itemId = interaction.options.getString("id");
        const role = interaction.options.getRole("role");
        const name = interaction.options.getString("name");
        const price = interaction.options.getInteger("price");
        const description = interaction.options.getString("description") ?? "";

        addShopRole(interaction.guild.id, itemId, role.id, name, role.toString(), description, price);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`✅ ${role} dijual sebagai **${name}** (💎 ${price.toLocaleString()}). Beli pakai \`/buy role:${itemId}\`.`)
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
