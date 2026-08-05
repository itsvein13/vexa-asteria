import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { isRaidModeActive, raidModeRemainingMs } from "../../utils/antiRaid.js";
import { formatDuration } from "../../utils/duration.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";

export default {

    data: new SlashCommandBuilder()
        .setName("raid-status")
        .setDescription("Check whether Anti-Raid mode is currently active.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {

        const active = isRaidModeActive(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor(active ? COLORS.danger : EMBED_COLOR)
            .setTitle(active ? "🛡️ Anti-Raid: Mode Waspada AKTIF" : "🛡️ Anti-Raid: Normal")
            .setDescription(
                active
                    ? [
                        `Vexa sedang dalam mode waspada — sisa **${formatDuration(raidModeRemainingMs(interaction.guild.id))}**.`,
                        "Member baru yang join dengan akun < 7 hari akan otomatis di-kick.",
                        "",
                        "Salah deteksi (false positive)? Jalankan `/raid-clear`."
                    ].join("\n")
                    : "Tidak ada aktivitas mencurigakan — semua join dipantau seperti biasa."
            )
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
