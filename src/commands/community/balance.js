import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getBalance, getInventory } from "../../database/economy.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your Shards balance.")
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Check another member.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member") ?? interaction.user;
        const balance = getBalance(user.id, interaction.guild.id);
        const items = getInventory(user.id, interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setAuthor({
                name: user.displayName ?? user.username,
                iconURL: user.displayAvatarURL({ extension: "png", size: 128 })
            })
            .setDescription([
                `💎 **${balance.toLocaleString()} Shards**`,
                `🎒 Item dimiliki: **${items.length}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};
