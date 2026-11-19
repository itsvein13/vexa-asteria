import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import SHOP_ITEMS, { getShopItem } from "../../config/shopItems.js";
import { purchaseItem, spendShards, getBalance, isUnlimited } from "../../database/economy.js";
import { getShopRole, getShopRoles } from "../../database/shopRoles.js";
import { getShopBadge, getShopBadges, ownsBadge, grantBadge } from "../../database/shopBadges.js";
import { setActiveTheme } from "../../database/profileSettings.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";

/**
 * Semua yang bisa dibeli, dalam satu daftar: theme + role + badge.
 * Dipakai /buy buat autocomplete dan /shop buat nampilin daftar.
 */
export function getAllBuyables(guildId) {

    const list = [];

    for (const item of SHOP_ITEMS) {
        list.push({
            kind: "theme",
            id: item.id,
            value: item.id,
            name: item.name,
            emoji: item.emoji,
            price: item.price,
            description: item.description
        });
    }

    for (const role of getShopRoles(guildId)) {
        list.push({
            kind: "role",
            id: role.item_id,
            value: `role:${role.item_id}`,
            name: role.name,
            emoji: role.emoji,
            price: role.price,
            description: role.description
        });
    }

    for (const badge of getShopBadges(guildId)) {
        list.push({
            kind: "badge",
            id: badge.item_id,
            value: `badge:${badge.item_id}`,
            name: badge.name,
            emoji: badge.emoji,
            price: badge.price,
            description: badge.description
        });
    }

    return list;

}

/** Pilihan buat autocomplete — maksimal 25 (batas Discord). */
export function getBuyChoices(guildId) {
    return getAllBuyables(guildId).slice(0, 25);
}

export default {

    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy an item from the shop.")
        .addStringOption(option =>
            option
                .setName("item")
                .setDescription("Apa yang mau dibeli — ketik buat nyari (mis. Mythical).")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction) {

        const itemId = interaction.options.getString("item");
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        // ---- Role yang dijual ----------------------------------------
        if (itemId.startsWith("role:")) {
            return buyRole(interaction, itemId.slice(5), guildId, userId);
        }

        // ---- Badge yang dijual ---------------------------------------
        if (itemId.startsWith("badge:")) {
            return buyBadge(interaction, itemId.slice(6), guildId, userId);
        }

        // ---- Theme (item biasa) --------------------------------------
        const item = getShopItem(itemId);

        if (!item) {
            return interaction.reply({
                content: "⚠️ Item tidak ditemukan.",
                flags: MessageFlags.Ephemeral
            });
        }

        const result = purchaseItem(userId, guildId, item.id, item.price);

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

        if (item.type === "theme") {
            setActiveTheme(userId, guildId, item.id);
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

/** Beli role yang dijual. */
async function buyRole(interaction, itemId, guildId, userId) {

    const role = getShopRole(guildId, itemId);

    if (!role) {
        return interaction.reply({
            content: "⚠️ Role ini nggak dijual.",
            flags: MessageFlags.Ephemeral
        });
    }

    const member = interaction.member;
    const already = member?.roles?.cache?.has(role.role_id);

    if (already) {
        return interaction.reply({
            content: `Kamu udah punya ${role.name}.`,
            flags: MessageFlags.Ephemeral
        });
    }

    const result = spendShards(userId, guildId, role.price);

    if (!result.ok) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.danger)
            .setDescription(`❌ Saldo kurang — butuh 💎 **${role.price.toLocaleString()}**, saldomu **${result.balance.toLocaleString()}**.`)
            .setFooter(EMBED_FOOTER);
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    try {
        await member.roles.add(role.role_id);
    } catch (error) {
        console.error(`⚠️ Gagal kasih role ${role.role_id}: ${error.message}`);
        return interaction.reply({
            content: "⚠️ Gagal kasih role — cek posisi role bot di atas role ini.",
            flags: MessageFlags.Ephemeral
        });
    }

    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription([
            `Kamu beli ${role.emoji} **${role.name}** — role udah kepasang!`,
            "",
            `Sisa saldo: 💎 **${result.balance.toLocaleString()} Shards**`
        ].join("\n"))
        .setFooter(EMBED_FOOTER);

    await interaction.reply({ embeds: [embed] });

}

/** Beli badge yang dijual. */
async function buyBadge(interaction, itemId, guildId, userId) {

    const badge = getShopBadge(guildId, itemId);

    if (!badge) {
        return interaction.reply({
            content: "⚠️ Badge ini nggak dijual.",
            flags: MessageFlags.Ephemeral
        });
    }

    if (ownsBadge(userId, guildId, badge.item_id)) {
        return interaction.reply({
            content: `Kamu udah punya ${badge.emoji} **${badge.name}**.`,
            flags: MessageFlags.Ephemeral
        });
    }

    const result = spendShards(userId, guildId, badge.price);

    if (!result.ok) {
        const embed = new EmbedBuilder()
            .setColor(COLORS.danger)
            .setDescription(`❌ Saldo kurang — butuh 💎 **${badge.price.toLocaleString()}**, saldomu **${result.balance.toLocaleString()}**.`)
            .setFooter(EMBED_FOOTER);
        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    grantBadge(userId, guildId, badge.item_id);

    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setDescription([
            `Kamu beli ${badge.emoji} **${badge.name}**!`,
            "",
            `Sisa saldo: 💎 **${result.balance.toLocaleString()} Shards**`
        ].join("\n"))
        .setFooter(EMBED_FOOTER);

    await interaction.reply({ embeds: [embed] });

}
