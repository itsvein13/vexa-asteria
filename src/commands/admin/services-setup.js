import {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { setServiceCatalogChannel } from "../../database/serviceCatalogConfig.js";
import { refreshServiceCatalogPanel } from "../../utils/serviceCatalog.js";

export default {

    data: new SlashCommandBuilder()
        .setName("services-setup")
        .setDescription("Post the service catalog panel to a channel (e.g. the ticket channel).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel to post the catalog in (e.g. #open-ticket).")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");

        setServiceCatalogChannel(interaction.guild.id, channel.id);

        const posted = await refreshServiceCatalogPanel(interaction.client, interaction.guild.id);

        await interaction.reply({
            content: posted
                ? `✅ Katalog jasa terkirim ke ${channel}. Panel ini bakal otomatis ke-update tiap kali harga diubah lewat \`/service-price-set\` atau \`/service-price-remove\`.`
                : `⚠️ Gagal kirim ke ${channel} — cek permission bot di channel itu (butuh Send Messages + Embed Links).`,
            flags: MessageFlags.Ephemeral
        });

    }

};
