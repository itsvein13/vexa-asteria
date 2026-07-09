import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";
import THEMES from "../../config/themes.js";
import { ownsItem } from "../../database/economy.js";
import { setActiveTheme, getActiveTheme } from "../../database/profileSettings.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("theme")
        .setDescription("Switch your profile card theme.")
        .addStringOption(option =>
            option
                .setName("theme")
                .setDescription("Theme to activate.")
                .setRequired(true)
                .addChoices(
                    ...Object.values(THEMES).map(theme => ({
                        name: `${theme.name}`,
                        value: theme.id
                    }))
                )
        ),

    async execute(interaction) {

        const themeId = interaction.options.getString("theme");
        const theme = THEMES[themeId];

        // 'default' selalu boleh; selain itu harus dimiliki
        if (themeId !== "default" &&
            !ownsItem(interaction.user.id, interaction.guild.id, themeId)) {

            return interaction.reply({
                content: `🔒 Kamu belum punya **${theme.name}**. Beli dulu di \`/shop\`.`,
                flags: MessageFlags.Ephemeral
            });

        }

        const current = getActiveTheme(interaction.user.id, interaction.guild.id);

        if (current === themeId) {
            return interaction.reply({
                content: `${theme.emoji} **${theme.name}** sudah aktif.`,
                flags: MessageFlags.Ephemeral
            });
        }

        setActiveTheme(interaction.user.id, interaction.guild.id, themeId);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription(`🎨 Theme diganti ke ${theme.emoji} **${theme.name}**. Cek dengan \`/profile\`!`)
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};
