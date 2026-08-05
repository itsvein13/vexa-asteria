import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getInviteStats } from "../../database/inviteTracking.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("invites")
        .setDescription("Check how many members someone has invited.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Member to check (default: you).")
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member") ?? interaction.user;
        const stats = getInviteStats(interaction.guild.id, user.id);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`📨 Invites — ${user.tag}`)
            .setDescription([
                `Invite aktif: **${stats.active}**`,
                `Total pernah join lewat invite kamu: **${stats.totalJoins}**`,
                `Sudah keluar lagi: **${stats.left}**`,
                "",
                "-# \"Aktif\" = member yang join lewat invite kamu dan masih di server."
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};
