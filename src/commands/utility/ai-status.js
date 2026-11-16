import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

import { AI_CONFIG } from "../../config/ai.config.js";
import { getAiQuota } from "../../utils/aiRateLimit.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("ai-status")
        .setDescription("Cek sisa kuota AI Vexa kamu.")
        .setDMPermission(false),

    async execute(interaction) {

        const quota = getAiQuota(interaction.user.id, interaction.channelId);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🤖 Status AI Vexa")
            .setDescription(
                quota.owner
                    ? "Kamu owner — kuota nggak dibatasi."
                    : `Sisa kuota kamu di channel ini: **${quota.remaining}** dari **${quota.limit}** pesan.`
            )
            .addFields(
                {
                    name: "Channel ini",
                    value: `\`${interaction.channel?.name ?? "unknown"}\``,
                    inline: true
                },
                {
                    name: "Jatah",
                    value: quota.owner
                        ? "∞ (owner)"
                        : `${quota.used}/${quota.limit} terpakai`,
                    inline: true
                },
                {
                    name: "Reset",
                    value: "Tiap 24 jam",
                    inline: true
                }
            )
            .setFooter(EMBED_FOOTER);

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

    }

};
