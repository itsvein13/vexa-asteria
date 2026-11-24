import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import safeSend from "../../utils/safeSend.js";
import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

const REEL_URL = "https://www.instagram.com/reel/DgIOJLpppQA/";
const REEL_IMAGE =
    "https://scontent-cgk1-1.cdninstagram.com/v/t51.71878-15/931576462_2058715664830244_7166897478556505397_n.jpg?stp=cmp1_dst-jpg_e35_s640x640_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ccb=7-5&_nc_sid=18de74&efg=eyJlZm...MifQ%3D%3D&_nc_ohc=y5ObdOJuxwcQ7kNvwF-5YRX&_nc_oc=AdoMD3QE1F96dTAp9yK6XYXsJRbQqAsQ1NWXTou3IgSVq_AYHxx0P50NPXFZ-h1PgZ4&_nc_zt=23&_nc_ht=scontent-cgk1-1.cdninstagram.com&_nc_gid=3hvssL-7GjtrlOpRTdV9rg&_nc_ss=78b02&_nc_ct=RQosPBUKFQoAAAA&oh=00_AQRuurCHeqBMVP-uXv_xxJLsA1Vch5T89TW7N_ov52IXVQ&oe=6B0B7AF2";

/**
 * Announcement reels IG SYND1CATE ke #announcement.
 * Owner-only. Poster = thumbnail reels.
 */
export default {

    data: new SlashCommandBuilder()
        .setName("ig-reel")
        .setDescription("Announcement reels IG SYND1CATE ke #announcement.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel tujuan (default: announcements).")
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("everyone")
                .setDescription("Tag @everyone (default: ya).")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const channel = interaction.options.getChannel("channel")
            ?? interaction.guild.channels.cache.get("1309675924417024100");

        if (!channel?.isTextBased?.()) {
            return interaction.reply({
                content: "⚠️ Channel nggak ketemu atau bukan channel teks.",
                flags: MessageFlags.Ephemeral
            });
        }

        const tagEveryone = interaction.options.getBoolean("everyone") ?? true;

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("📸 New Reel Alert")
            .setDescription([
                "SYND1CATE just dropped a new reel on Instagram.",
                "",
                "Give it a watch, hit follow while you're there (we'll follow you back), and share it around if it hits.",
                "",
                `Watch here: ${REEL_URL}`
            ].join("\n"))
            .setImage(REEL_IMAGE)
            .setFooter(EMBED_FOOTER);

        const sent = await safeSend(channel, {
            content: tagEveryone ? "||@everyone||" : undefined,
            embeds: [embed]
        });

        await interaction.reply({
            content: sent
                ? `✅ Reel announcement terkirim ke ${channel}.`
                : `⚠️ Gagal kirim ke ${channel} — cek permission bot di channel itu.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
