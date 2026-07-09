import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import SHOP_ITEMS, { getShopItem } from "../../config/shopItems.js";
import { purchaseItem } from "../../database/economy.js";
import { setActiveTheme } from "../../database/profileSettings.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";

export default {

    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy an item from the shop.")
        .addStringOption(option =>
            option
                .setName("item")
                .setDescription("The item to buy.")
                .setRequired(true)
                .addChoices(
                    ...SHOP_ITEMS.map(item => ({
                        name: `${item.name} — ${item.price.toLocaleString()} Shards`,
                        value: item.id
                    }))
                )
        ),

    async execute(interaction) {

        const itemId = interaction.options.getString("item");
        const item = getShopItem(itemId);

        if (!item) {
            return interaction.reply({
                content: "⚠️ Item tidak ditemukan.",
                flags: MessageFlags.Ephemeral
            });
        }

        const result = purchaseItem(
            interaction.user.id,
            interaction.guild.id,
            item.id,
            item.price
        );

        if (!result.ok) {

            const msg = result.reason === "owned"
                ? `Kamu sudah punya ${item.emoji} **${item.name}**.`
                : `Saldo kurang — butuh 💎 **${item.price.toLocaleString()}**, saldomu **${result.balance.toLocaleString()}**.`;

            const embed = new EmbedBuilder()
                .setColor(COLORS.danger)
                .setDescription(`❌ ${msg}`)
                .setFooter(EMBED_FOOTER);

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        }

        // Theme yang baru dibeli langsung dipasang — UX paling intuitif.
        if (item.type === "theme") {
            setActiveTheme(interaction.user.id, interaction.guild.id, item.id);
        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🛍️ Pembelian Berhasil")
            .setDescription([
                `Kamu membeli ${item.emoji} **${item.name}**!`,
                item.type === "theme" ? "Theme langsung dipasang di profile card kamu. Cek dengan `/profile`." : "",
                "",
                `Sisa saldo: 💎 **${result.balance.toLocaleString()} Shards**`
            ].filter(Boolean).join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};
