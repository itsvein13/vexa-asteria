import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import { getOwnedBadges, setActiveBadge, getActiveBadge } from "../../database/shopBadges.js";
import { getShopBadges } from "../../database/shopBadges.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

/**
 * Lihat badge yang dimiliki + pilih badge aktif buat profile card.
 */
export default {

    data: new SlashCommandBuilder()
        .setName("badge")
        .setDescription("Lihat dan pasang badge kamu.")
        .addStringOption(option =>
            option
                .setName("badge")
                .setDescription("Badge yang mau dipasang (kosongkan buat lepas).")
                .setRequired(false)
        ),

    async execute(interaction) {

        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const owned = getOwnedBadges(userId, guildId);
        const catalog = getShopBadges(guildId);
        const active = getActiveBadge(userId, guildId);

        const pick = interaction.options.getString("badge");

        if (!pick) {

            const lines = owned.length
                ? owned.map(b => {
                    const meta = catalog.find(c => c.item_id === b.item_id);
                    const emoji = meta?.emoji ?? "🏷️";
                    const activeMark = active?.item_id === b.item_id ? " ✅ aktif" : "";
                    return `${emoji} **${meta?.name ?? b.item_id}**${activeMark}  ·  \`/badge ${b.item_id}\``;
                })
                : ["Belum punya badge. Coba `/gacha` atau `/buy badge:<id>`."];

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("🏷️ Badge Kamu")
                .setDescription(lines.join("\n"))
                .setFooter(EMBED_FOOTER);

            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        }

        if (!owned.some(b => b.item_id === pick)) {
            return interaction.reply({
                content: "⚠️ Kamu belum punya badge itu.",
                flags: MessageFlags.Ephemeral
            });
        }

        setActiveBadge(userId, guildId, pick);

        const meta = catalog.find(c => c.item_id === pick);
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`✅ Badge ${meta?.emoji ?? "🏷️"} **${meta?.name ?? pick}** dipasang.`)
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
