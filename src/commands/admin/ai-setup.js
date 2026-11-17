import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { AI_CONFIG } from "../../config/ai.config.js";
import safeSend from "../../utils/safeSend.js";

// Judul panel — dipakai juga sama auto-starter di ready.js dan
// pembersih di aiChannel.js. Kalau diubah, ubah ketiganya.
export const AI_PANEL_TITLE = "🤖 Vexa AI — aktif di sini";

export function buildAiPanel() {

    return new EmbedBuilder()
        .setColor("#7C3AED")
        .setTitle(AI_PANEL_TITLE)
        .setDescription(
            [
                "Gue Vexa, sekarang udah integrasi sama AI. Mentions gue buat nanya apa aja.",
                "",
                "**Cara pakai**",
                "`@Vexa <pertanyaan>` — tanya apa aja, gue jawab.",
                "",
                "**Aturan main**",
                `• Kuota **${AI_CONFIG.limits.vexaAiChannelLimit} pesan** per 24 jam di channel ini.`,
                `• Di channel lain, **${AI_CONFIG.limits.otherChannelLimit} pesan** per 24 jam.`,
                "• `/ai-status` buat cek sisa kuota kamu.",
                "",
                "**Yang nggak gue layani**",
                "• Kick / ban / mute / warn member — itu urusan staff.",
                "• Kasih role admin / owner / moderator.",
                "• Atur Shards / ekonomi server.",
                "• Pertanyaan soal model di balik gue — rahasia.",
                "",
                "Santai aja, gue di sini buat teman ngobrol."
            ].join("\n")
        )
        .setFooter({ text: "Powered by Vexa" });

}

export default {

    data: new SlashCommandBuilder()
        .setName("ai-setup")
        .setDescription("Kirim panel pembuka AI Vexa ke channel (default: #vexa-ai).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel tujuan panel (kosongkan buat pakai #vexa-ai).")
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {

        // Defer dulu — kirim embed bisa molor, kalau langsung reply
        // nanti kena 10062 (Unknown interaction).
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.warn(`⚠️ ai-setup deferReply gagal (${error.code ?? "UNKNOWN"})`);
            return;
        }

        const channel = interaction.options.getChannel("channel")
            ?? interaction.guild?.channels?.cache?.get(AI_CONFIG.channel.vexaAiChannelId)
            ?? interaction.channel;

        if (!channel?.isTextBased?.()) {
            await interaction.editReply({ content: "Channel nggak ketemu, bro." });
            return;
        }

        const sent = await safeSend(channel, { embeds: [buildAiPanel()] });

        await interaction.editReply({
            content: sent
                ? `✅ Panel AI terkirim ke ${channel}.`
                : `⚠️ Gagal kirim ke ${channel} — cek permission bot di channel itu.`
        });

    }

};
