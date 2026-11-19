import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import SHOP_ITEMS from "../../config/shopItems.js";
import { getBalance, getInventory, isUnlimited } from "../../database/economy.js";
import { getShopRoles } from "../../database/shopRoles.js";
import { getShopBadges } from "../../database/shopBadges.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("shop")
        .setDescription("Browse the Synd1cate shop."),

    async execute(interaction) {

        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const owned = new Set(getInventory(userId, guildId));
        const balance = getBalance(userId, guildId);
        const unlimited = isUnlimited(userId, guildId);

        // ---- Theme ---------------------------------------------------
        const themeLines = SHOP_ITEMS.map(item => {

            const status = owned.has(item.id)
                ? "✅ dimiliki"
                : `💎 **${item.price.toLocaleString()}**`;

            return [
                `${item.emoji} **${item.name}** — ${status}`,
                `-# ${item.description}  ·  \`/buy ${item.id}\``
            ].join("\n");

        });

        // ---- Role ----------------------------------------------------
        const roles = getShopRoles(guildId);
        const roleLines = roles.length
            ? roles.map(r => `${r.emoji} **${r.name}** — 💎 **${r.price.toLocaleString()}**`)
            : ["-# Belum ada role dijual."];

        // ---- Badge ---------------------------------------------------
        const badges = getShopBadges(guildId);
        const badgeLines = badges.length
            ? badges.map(b => `${b.emoji} **${b.name}** — 💎 **${b.price.toLocaleString()}**`)
            : ["-# Belum ada badge. Coba \`/gacha\`."];

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🛒 Synd1cate Shop")
            .setDescription("Mau beli apa? Ketik \`/buy\` terus **ketik nama** buat nyari.")
            .addFields(
                { name: "🎨 Theme Profile", value: themeLines.join("\n\n") },
                { name: "👑 Role", value: roleLines.join("\n") },
                { name: "🏷️ Badge", value: badgeLines.join("\n") }
            )
            .setFooter({
                text: unlimited
                    ? "Saldomu: ∞ (unlimited)"
                    : `Saldomu: ${balance.toLocaleString()} Shards • ${EMBED_FOOTER.text}`
            });

        await interaction.reply({ embeds: [embed] });

    }

};
