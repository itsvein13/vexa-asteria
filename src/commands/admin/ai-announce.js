import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { AI_CONFIG } from "../../config/ai.config.js";
import { EMBED_FOOTER } from "../../config/constants.js";
import safeSend from "../../utils/safeSend.js";

// Poster integrasi AI.
const POSTER_URL = "https://cdn.discordapp.com/attachments/1406140289344602192/1571735366468243546/VEXA_AI.png?ex=6afbd020&is=6afa7ea0&hm=666d3e67d9c5cff2613c5f3d4282c9e062976f6d0e916a992a9795951931068b&";

const aiChannel = `<#${AI_CONFIG.channel.vexaAiChannelId}>`;

const ID_DESCRIPTION = [
    "🤖 **VEXA AI IS LIVE**",
    "",
    "**Hai Syndicate!**",
    "",
    "Vexa sekarang udah punya otak. Bukan bot biasa lagi.",
    "",
    "Gue nyambung ke AI, jadi lu bisa nanya apa aja langsung ke gue. Kapan aja, di mana aja.",
    "",
    "Bukan template. Bukan bot pas-pasan. Ini Vexa.",
    "",
    "**Cara pakai**",
    "",
    "Mention aja `@Vexa` terus tulis pertanyaan lu. Gue bales di channel yang sama.",
    "",
    `Gas coba sekarang di ${aiChannel}.`,
    "",
    "**Rules**",
    "",
    `Kuota di ${aiChannel} **2 pesan per 24 jam**`,
    "",
    "Kuota di channel lain **1 pesan per 24 jam**",
    "",
    "Cek sisa kuota lu pakai `/ai-status`",
    "",
    "Kalau kuota habis, tunggu reset 24 jam. Gue juga capek mikir.",
    "",
    "**Syarat**",
    "",
    "Gue layani: tanya jawab, curhat, ide, bantuan teknis, debat receh, sampe nemenin lu bosen.",
    "",
    "Gue nggak layani: kick, ban, mute, atur role, atur Shards, dan pertanyaan soal model di balik gue. Itu urusan staff, dan rahasia.",
    "",
    "Jangan spam. Jangan nyoba bikin gue ngelakuin hal yang merugikan orang lain.",
    "",
    "Bosen? Gue temani. Butuh bantuan beneran? Staff siap."
].join("\n");

const EN_DESCRIPTION = [
    "**English version**",
    "",
    "**Hey Syndicate!**",
    "",
    "Vexa now has a brain. Not just a regular bot anymore.",
    "",
    "I'm connected to AI now, so you can ask me anything. Anytime, anywhere.",
    "",
    "Not a template. Not a half-baked bot. This is Vexa.",
    "",
    "**How to use**",
    "",
    "Just mention `@Vexa` and write your question. I'll reply in the same channel.",
    "",
    `Try it out in ${aiChannel}.`,
    "",
    "**Rules**",
    "",
    `Quota in ${aiChannel} **2 messages per 24 hours**`,
    "",
    "Quota in other channels **1 message per 24 hours**",
    "",
    "Check your quota with `/ai-status`",
    "",
    "When your quota runs out, wait for the 24 hour reset. I get tired too.",
    "",
    "**Terms**",
    "",
    "I help with: questions, venting, ideas, technical help, light debates, even keeping you company when you're bored.",
    "",
    "I don't help with: kicks, bans, mutes, role management, Shards management, and questions about the model behind me. That's staff business, and it's confidential.",
    "",
    "Don't spam. Don't try to make me do anything that hurts others.",
    "",
    "Bored? I'm here. Need real help? Staff is ready."
].join("\n");

export default {

    data: new SlashCommandBuilder()
        .setName("ai-announce")
        .setDescription("Kirim announcement integrasi AI Vexa.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel tujuan announcement.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        // Defer dulu — kirim embed ke channel lain bisa molor >3 detik,
        // kalau langsung reply nanti kena 10062 (Unknown interaction).
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.warn(`⚠️ ai-announce deferReply gagal (${error.code ?? "UNKNOWN"})`);
            return;
        }

        const channel = interaction.options.getChannel("channel");

        const embed = new EmbedBuilder()
            .setColor("#7C3AED")
            .setTitle("🤖 VEXA AI IS LIVE")
            .setDescription(ID_DESCRIPTION)
            .addFields(
                {
                    name: "English",
                    value: EN_DESCRIPTION
                }
            )
            .setImage(POSTER_URL)
            .setFooter(EMBED_FOOTER);

        const sent = await safeSend(channel, {
            content: "||@everyone||",
            embeds: [embed]
        });

        await interaction.editReply({
            content: sent
                ? `✅ Announcement terkirim ke ${channel}.`
                : `⚠️ Gagal kirim ke ${channel} — cek permission bot di channel itu.`
        });

    }

};
