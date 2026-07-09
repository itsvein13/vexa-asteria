import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import SHOP_ITEMS from "../../config/shopItems.js";
import { getBalance, getInventory } from "../../database/economy.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Browse the Synd1cate shop."),

    async execute(interaction) {

        const owned = new Set(getInventory(interaction.user.id, interaction.guild.id));
        const balance = getBalance(interaction.user.id, interaction.guild.id);

        const lines = SHOP_ITEMS.map(item => {

            const status = owned.has(item.id)
                ? "✅ dimiliki"
                : `💎 **${item.price.toLocaleString()}**`;

            return [
                `${item.emoji} **${item.name}** — ${status}`,
                `-# ${item.description}  ·  \`/buy item:${item.id}\``
            ].join("\n");

        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🛒 Synd1cate Shop")
            .setDescription(lines.join("\n\n"))
            .setFooter({ text: `Saldomu: ${balance.toLocaleString()} Shards • ${EMBED_FOOTER.text}` });

        await interaction.reply({ embeds: [embed] });

    }

};
