import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { EMBED_FOOTER } from "../../config/constants.js";
import COLORS from "../../config/colors.js";
import safeSend from "../../utils/safeSend.js";
import { recordSetupRun } from "../../database/setupLog.js";

export default {

    data: new SlashCommandBuilder()
        .setName("rules-setup")
        .setDescription("Post the server rules panel (Indonesian + English).")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel to post the rules in (e.g. #rules).")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        const channel = interaction.options.getChannel("channel");

        const idEmbed = new EmbedBuilder()
            .setColor(COLORS.accent)
            .setTitle("📜 RULES SYND1CATE — Baca Dulu Biar Gak Kena Ban Prank 😤")
            .setDescription([
                "Yo, sebelum ngacir ke voice atau war di Valorant, absen dulu baca ini.",
                "Gak panjang kok, tapi wajib dipahamin — biar SYND1CATE tetep asik buat semua orang.",
                "",
                "**1. Respect is the vibe** 🤝",
                "Toxic boleh pas lagi push rank, tapi jangan ke sesama member. No rasis, no SARA, no body-shaming, no bully. Ketauan? Auto masuk radar staff.",
                "",
                "**2. Jangan jadi tukang spam** 🚫",
                "Promosi sembarangan, link giveaway ngasal, atau spam pesan yang sama di banyak channel bakal ke-deteksi otomatis — dan sistemnya bisa langsung **ban sendiri**. Serius, Vexa standby 24/7 buat nangkep ini.",
                "",
                "**3. Aman buat semua umur** 🔞",
                "NSFW, gore, konten sadis — gak ada tempatnya di sini. Simpen buat server lain.",
                "",
                "**4. Drama? DM aja atau bikin ticket** 🎫",
                "Ada masalah sama member lain? Jangan war di depan umum, malu-maluin doang. Buka `/ticket` atau selesain secara personal.",
                "",
                "**5. Chat di tempatnya** 📍",
                "Tiap channel ada fungsinya masing-masing — baca dulu, jangan asal nyempil.",
                "",
                "**6. No raid, no alt army** ⚔️",
                "Ngajak orang buat spam/raid server bakal ke-deteksi Anti-Raid, akun mencurigakan langsung ke-kick otomatis. Gak main-main.",
                "",
                "**7. Staff punya kata akhir** 👑",
                "Gak setuju sama keputusan mod? Sah-sah aja nanya baik-baik lewat ticket. Yang gak boleh: war di chat publik atau spam DM staff.",
                "",
                "**8. Jangan nyamar jadi orang lain** 🎭",
                "Impersonate staff, member, atau siapapun buat nipu = pelanggaran berat.",
                "",
                "**9. Bahasa bebas, sopan wajib** 🗣️",
                "Mau ngetik Indo atau English, gaskeun aja. Yang penting bukan buat nyakitin orang.",
                "",
                "**10. Sistem hukumannya jelas, bukan asal tuduh** ⚖️",
                "Ada pelanggaran → Warn (tercatat, ada nomor case-nya) → Mute → Kick → Ban kalau kebangetan. Semua kelacak, jadi fair buat semua pihak.",
                "",
                "**11. Minimal umur 13 tahun** — ini aturan Discord, bukan aturan kita doang.",
                "",
                "Udah? Gaskeun have fun — war di game boleh, war di attitude jangan. See you di voice! 🎮✨"
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        const enEmbed = new EmbedBuilder()
            .setColor(COLORS.divider)
            .setTitle("📜 SYND1CATE RULES — Read First, Ban Prank Not Included 😤")
            .setDescription([
                "Yo, before you dash off to voice or start a Valorant war, read this first.",
                "Won't take long, but it's non-negotiable — it's what keeps SYND1CATE fun for literally everyone.",
                "",
                "**1. Respect is the vibe** 🤝",
                "Talk trash all you want mid-ranked game, but not to your fellow members. No racism, no discrimination, no body-shaming, no bullying. Get caught, and you're on staff's radar.",
                "",
                "**2. Don't be a spam bot** 🚫",
                "Random self-promo, sketchy giveaway links, or copy-pasting the same message across channels gets auto-flagged — and yeah, our system might just ban you on its own. Vexa's watching 24/7, no cap.",
                "",
                "**3. Keep it safe for everyone** 🔞",
                "NSFW, gore, anything graphic — not the place. Take it elsewhere.",
                "",
                "**4. Got beef? DM it or open a ticket** 🎫",
                "Personal drama doesn't belong in public chat, it's just embarrassing for everyone. Open `/ticket` or sort it out privately.",
                "",
                "**5. Use channels for what they're for** 📍",
                "Every channel has a purpose — read the name before you dump your message there.",
                "",
                "**6. No raids, no alt armies** ⚔️",
                "Bringing people in to spam or raid the server gets caught by our Anti-Raid system — suspicious accounts get auto-kicked. We don't play about this.",
                "",
                "**7. Staff has the final call** 👑",
                "Disagree with a mod decision? Cool, open a ticket and talk it out. What's not cool: arguing in public chat or spamming staff DMs.",
                "",
                "**8. Don't impersonate anyone** 🎭",
                "Pretending to be staff or another member to scam people is a hard no.",
                "",
                "**9. Speak whatever, just be decent** 🗣️",
                "Indonesian or English, go off. Just don't use it to hurt people.",
                "",
                "**10. Punishment system is transparent, not random** ⚖️",
                "Break a rule → get a Warn (logged with a case number) → escalates to Mute → Kick → Ban if it keeps happening. Everything's tracked, so it's fair for everyone.",
                "",
                "**11. Minimum age is 13** — that's Discord's rule, not just ours.",
                "",
                "That's it. Go have fun, talk trash in-game, not in real life. See you in voice! 🎮✨"
            ].join("\n"))
            .setFooter(EMBED_FOOTER);

        const sent = await safeSend(channel, { embeds: [idEmbed, enEmbed] });

        if (sent) {
            recordSetupRun(interaction.guild.id, "rules-setup");
        }

        await interaction.reply({
            content: sent
                ? `✅ Rules panel terkirim ke ${channel}.`
                : `⚠️ Gagal kirim ke ${channel} — cek permission bot di channel itu.`,
            flags: MessageFlags.Ephemeral
        });

    }

};
