import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { addShards } from "../../database/economy.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

export default {

    data: new SlashCommandBuilder()
        .setName("give-shards")
        .setDescription("Give Shards to a member (event reward, etc).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Recipient.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount of Shards (use negative to deduct).")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("member");
        const amount = interaction.options.getInteger("amount");

        const balance = addShards(user.id, interaction.guild.id, amount);

        const verb = amount >= 0 ? "menerima" : "dikurangi";

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setDescription([
                `💎 ${user} ${verb} **${Math.abs(amount).toLocaleString()} Shards**.`,
                `Saldo sekarang: **${balance.toLocaleString()}**`
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        await interaction.reply({ embeds: [embed] });

    }

};
