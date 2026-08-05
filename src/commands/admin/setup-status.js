import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import { getSetupRunAt } from "../../database/setupLog.js";
import { getTicketConfig } from "../../database/tickets.js";
import { getSuggestionChannel } from "../../database/suggestions.js";
import { getTestimonialChannel } from "../../database/testimonials.js";
import { getAutomodLogChannel } from "../../database/automodConfig.js";
import { getModLogChannel } from "../../database/modLogConfig.js";
import { getCreatorReviewChannel } from "../../database/creatorApplications.js";
import { getClockChannel } from "../../utils/clockChannel.js";
import { getLevelRoles } from "../../database/levelRoles.js";
import { getMilestones } from "../../database/referralRewards.js";

function line(done, label, command) {
    return `${done ? "✅" : "❌"} **${label}** — \`/${command}\``;
}

export default {

    data: new SlashCommandBuilder()
        .setName("setup-status")
        .setDescription("Check which setup commands have been configured for this server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const guildId = interaction.guild.id;

        const onboarding = [
            line(Boolean(getSetupRunAt(guildId, "verify-setup")), "Verifikasi", "verify-setup"),
            line(Boolean(getSetupRunAt(guildId, "roles-setup")), "Role Menu", "roles-setup"),
            line(Boolean(getSetupRunAt(guildId, "faq-setup")), "FAQ", "faq-setup"),
            line(Boolean(getSetupRunAt(guildId, "rules-setup")), "Rules", "rules-setup")
        ];

        const support = [
            line(Boolean(getTicketConfig(guildId)), "Ticketing", "ticket-setup"),
            line(Boolean(getSuggestionChannel(guildId)), "Suggestion Box", "suggestion-setup"),
            line(Boolean(getTestimonialChannel(guildId)), "Testimonials", "testimonial-setup")
        ];

        const safety = [
            line(Boolean(getAutomodLogChannel(guildId)), "AutoMod", "automod-setup"),
            line(Boolean(getModLogChannel(guildId)), "Moderation Log", "modlog-setup"),
            line(Boolean(getCreatorReviewChannel(guildId)), "Creator Review", "creator-review-setup")
        ];

        const extras = [
            line(Boolean(getClockChannel(guildId)), "Lofi Radio", "lofi-setup"),
            line(getLevelRoles(guildId).length > 0, "Level Roles", "level-roles-setup"),
            line(getMilestones(guildId).length > 0, "Referral Rewards", "referral-rewards-setup")
        ];

        const allLines = [...onboarding, ...support, ...safety, ...extras];
        const doneCount = allLines.filter(l => l.startsWith("✅")).length;
        const total = allLines.length;

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🛠️ Setup Status")
            .setDescription([

                `Progres konfigurasi server: **${doneCount}/${total}** selesai.`,
                "",
                "**👋 Onboarding**",
                ...onboarding,
                "",
                "**🎫 Support & Community**",
                ...support,
                "",
                "**🛡️ Safety**",
                ...safety,
                "",
                "**✨ Extras**",
                ...extras,
                "",
                "-# Jalankan command yang ❌ untuk mengaktifkan fitur itu."

            ].join("\n"))
            .setFooter(EMBED_FOOTER)
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

    }

};
