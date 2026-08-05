import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getInviteLeaderboard } from "../../database/inviteTracking.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

const MEDALS = ["🥇", "🥈", "🥉"];

export default {

    data: new SlashCommandBuilder()
        .setName("invites-leaderboard")
        .setDescription("Top inviters in this server."),

    async execute(interaction) {

        const top = getInviteLeaderboard(interaction.guild.id, 10);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("📨 Invite Leaderboard")
            .setFooter(EMBED_FOOTER);

        if (!top.length) {

            embed.setDescription("Belum ada data invite tercatat.");

        } else {

            const lines = top.map((row, i) =>
                `${MEDALS[i] ?? `**${i + 1}.**`} <@${row.inviterId}> — **${row.active}** invite aktif`
            );

            embed.setDescription(lines.join("\n"));

        }

        await interaction.reply({ embeds: [embed] });

    }

};
