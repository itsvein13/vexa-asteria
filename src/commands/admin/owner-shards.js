import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { isUnlimited, setUnlimited } from "../../database/economy.js";
import { AI_CONFIG } from "../../config/ai.config.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

/**
 * Set saldo unlimited buat owner. Cuma owner (userId/role owner)
 * yang boleh jalanin ini.
 */
export default {

    data: new SlashCommandBuilder()
        .setName("owner-shards")
        .setDescription("Set Shards unlimited buat owner (∞).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option
                .setName("unlimited")
                .setDescription("Nyalakan / matikan unlimited.")
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Kosongkan buat diri sendiri.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const target = interaction.options.getUser("member") ?? interaction.user;
        const on = interaction.options.getBoolean("unlimited");

        // Guard: cuma owner (userId atau role owner) yang boleh.
        const isOwner = String(target.id) === String(AI_CONFIG.limits.ownerUserId)
            || (AI_CONFIG.limits.ownerRoleIds ?? []).some(id =>
                interaction.member?.roles?.cache?.has?.(id)
            );

        if (!isOwner) {
            return interaction.reply({
                content: "Lu bukan owner, bro. Nggak bisa.",
                flags: MessageFlags.Ephemeral
            });
        }

        const now = setUnlimited(target.id, interaction.guild.id, on);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(
                now
                    ? `💎 ${target} sekarang **∞ Shards (unlimited)**.`
                    : `💎 Unlimited dimatikan buat ${target}.`
            )
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    }

};
