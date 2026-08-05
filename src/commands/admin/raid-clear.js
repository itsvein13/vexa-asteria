import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { isRaidModeActive, endRaidMode } from "../../utils/antiRaid.js";

export default {

    data: new SlashCommandBuilder()
        .setName("raid-clear")
        .setDescription("Manually end Anti-Raid mode (use if it was a false positive).")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {

        if (!isRaidModeActive(interaction.guild.id)) {
            await interaction.reply({
                content: "ℹ️ Anti-Raid sedang tidak dalam mode waspada — tidak ada yang perlu di-clear.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        endRaidMode(interaction.guild.id);

        await interaction.reply({
            content: "✅ Mode waspada Anti-Raid dimatikan. Auto-kick akun baru berhenti sampai gelombang join mencurigakan berikutnya terdeteksi lagi.",
            flags: MessageFlags.Ephemeral
        });

    }

};
