import {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";

import {
    getLeaderboard,
    getTrackedMemberCount,
    getRank
} from "../../database/levels.js";

import { generateLeaderboardCard } from "../../utils/leaderboard/card.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

const PAGE_SIZE = 10;

// Medali cuma untuk global rank 1-3, sisanya nomor biasa.
const MEDALS = ["🥇", "🥈", "🥉"];

function formatEntry(globalRank, entry) {

    const marker = MEDALS[globalRank - 1] ?? `**#${globalRank}**`;

    return [
        `${marker} <@${entry.userId}>`,
        `Level **${entry.level}** • ${entry.totalXP.toLocaleString()} XP`
    ].join(" — ");

}

function buildEmbed(interaction, page, totalPages) {

    const guildId = interaction.guild.id;
    const offset = (page - 1) * PAGE_SIZE;
    const entries = getLeaderboard(guildId, PAGE_SIZE, offset);

    const lines = entries.map((entry, i) =>
        formatEntry(offset + i + 1, entry)
    );

    const selfRank = getRank(interaction.user.id, guildId);

    return new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor({
            name: `${interaction.guild.name} — Leaderboard`,
            iconURL: interaction.guild.iconURL({ extension: "png", size: 128 }) ?? undefined
        })
        .setDescription(lines.join("\n"))
        .setFooter({
            text: `Page ${page}/${totalPages} • Posisimu: #${selfRank} • ${EMBED_FOOTER.text}`
        });

}

export default {

    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Top members of Synd1cate by XP.")
        .addIntegerOption(option =>
            option
                .setName("page")
                .setDescription("Leaderboard page (10 members per page).")
                .setMinValue(1)
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("list")
                .setDescription("Show a simple text list instead of the image card.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const guildId = interaction.guild.id;
        const total = getTrackedMemberCount(guildId);

        if (total === 0) {
            return interaction.reply({
                content: "Belum ada member yang punya XP. Mulai ngobrol dulu! 💬",
                flags: MessageFlags.Ephemeral
            });
        }

        const totalPages = Math.ceil(total / PAGE_SIZE);
        const page = Math.min(
            interaction.options.getInteger("page") ?? 1,
            totalPages
        );
        const wantsList = interaction.options.getBoolean("list") ?? false;

        // Halaman 1 tanpa opsi list → kartu canvas.
        // Halaman lain / opsi list → embed (kartu cuma render top 10).
        if (page === 1 && !wantsList) {

            await interaction.deferReply();

            try {

                const card = await generateLeaderboardCard(
                    interaction.guild,
                    interaction.client
                );

                if (card) {
                    return interaction.editReply({ files: [card] });
                }

            } catch (error) {
                // Render gagal → jangan gagalkan command, turun ke embed.
                console.error("Leaderboard card failed, falling back to embed:", error);
            }

            return interaction.editReply({
                embeds: [buildEmbed(interaction, page, totalPages)]
            });

        }

        await interaction.reply({
            embeds: [buildEmbed(interaction, page, totalPages)]
        });

    }

};
