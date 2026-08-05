import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { getCase } from "../../database/modCases.js";
import { formatDuration } from "../../utils/duration.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

const TYPE_LABELS = {
    warn: "⚠️ Warn",
    "warning-remove": "🗑️ Warning Removed",
    mute: "🔇 Mute",
    unmute: "🔊 Unmute",
    kick: "👢 Kick",
    ban: "🔨 Ban",
    unban: "🕊️ Unban"
};

export default {

    data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("Look up a moderation case by its number.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addIntegerOption(option =>
            option
                .setName("number")
                .setDescription("Case number.")
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction) {

        const caseNumber = interaction.options.getInteger("number");
        const modCase = getCase(interaction.guild.id, caseNumber);

        if (!modCase) {
            await interaction.reply({ content: `❌ Case #${caseNumber} tidak ditemukan.`, flags: MessageFlags.Ephemeral });
            return;
        }

        const lines = [
            `Member: <@${modCase.userId}> (\`${modCase.userId}\`)`,
            `Moderator: <@${modCase.moderatorId}>`,
            `Alasan: ${modCase.reason}`
        ];

        if (modCase.durationMs) lines.push(`Durasi: **${formatDuration(modCase.durationMs)}**`);
        if (modCase.type === "warn" && modCase.status === "removed") lines.push("Status: *dihapus*");

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`${TYPE_LABELS[modCase.type] ?? modCase.type} — Case #${modCase.caseNumber}`)
            .setDescription(lines.join("\n"))
            .setFooter(EMBED_FOOTER)
            .setTimestamp(modCase.createdAt);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
