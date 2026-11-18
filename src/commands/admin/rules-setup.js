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
"Yo, sebelum langsung nyelonong ke voice atau ngajak war di Valorant, baca ini dulu.",
"Tenang, gak panjang. Cuma beberapa hal biar kita semua bisa enjoy di sini tanpa bikin orang lain kesel.",
"",
"**1. Respect is the vibe** 🤝",
"Roasting pas mabar? Gas. Tapi tau batas. Jangan bawa-bawa rasis, SARA, body shaming, atau bully member lain. Kalau udah kelewatan, staff bakal turun tangan.",
"",
"**2. Jangan spam, ygy** 🚫",
"Self promo sembarangan, link aneh-aneh, atau ngirim pesan yang sama berkali-kali bakal langsung ke-detect. Vexa juga standby 24/7, jadi jangan nunggu staff online buat berulah.",
"",
"**3. Keep it clean** 🔞",
"NSFW, gore, atau konten yang terlalu graphic gak perlu dibawa ke sini. Banyak tempat lain buat begituan.",
"",
"**4. Ada masalah? Jangan bikin tontonan** 🎫",
"Kalau punya masalah sama member lain, gak perlu perang di public chat. Buka `/ticket` atau omongin baik-baik secara pribadi. Beres.",
"",
"**5. Jangan salah kamar** 📍",
"Setiap channel udah punya tempatnya masing-masing. Tinggal baca nama channel sebelum ngirim sesuatu. Gak susah kok.",
"",
"**6. No raids, no alt armies** ⚔️",
"Mau raid, spam, atau masukin pasukan akun alt? Coba aje. Sistem Anti Raid Vexa bakal nangkep akun yang mencurigakan dan bisa langsung nge-kick mereka.",
"",
"**7. Staff punya keputusan terakhir** 👑",
"Kalau gak setuju sama keputusan staff, silakan bahas lewat ticket. Yang gak perlu itu debat panjang di chat atau nge-spam DM staff.",
"",
"**8. Jangan ngaku-ngaku jadi orang lain** 🎭",
"Nyamar jadi staff, member, atau orang lain buat nipu atau ngejebak orang? Ini bukan becandaan. Langsung dianggap pelanggaran berat.",
"",
"**9. Mau Indo atau English, bebas** 🗣️",
"Mau ngomong Indo, English, atau campur aduk juga santai. Yang penting jangan sengaja nyari ribut atau bikin orang lain gak nyaman.",
"",
"**10. Semua ada catatannya** ⚖️",
"Kalau melanggar, ada Warn → Mute → Kick → Ban tergantung kasusnya. Setiap tindakan punya catatan dan case number, jadi gak ada hukuman yang tiba-tiba jatuh dari langit.",
"",
"**11. 13+ only**",
"Minimal umur 13 tahun. Ini aturan Discord, jadi ya kita ikutin.",
"",
"Udah, segitu aja. Sekarang lanjut mabar, ngobrol, atau cari ribut di game sana. Yang penting jangan cari ribut sama orangnya. See you around. 🎮"
            ].join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1543969058121064539/ID_RULES.png?ex=6a96ccbd&is=6a957b3d&hm=740ba571089c3a56e4884a041999baea6b96395fb1d6cfd2535c30c7e9ff7eff&")
            .setFooter(EMBED_FOOTER);

        const enEmbed = new EmbedBuilder()
            .setColor(COLORS.divider)
            .setTitle("📜 SYND1CATE RULES — Read First, Ban Prank Not Included 😤")
            .setDescription([
"Yo, before you disappear into voice or start another Valorant war, read this first.",
"Won't take long. Think of it as the code that keeps Synd1cate worth being part of.",
"",
"**1. Respect is the vibe** 🤝",
"Trash talk during ranked? Go for it. Just don't bring that energy onto other members. No racism, discrimination, body shaming, or bullying. Cross the line and you're on staff's radar.",
"",
"**2. Don't become a spam machine** 🚫",
"Random self promo, shady links, or repeating the same message across channels gets flagged fast. Vexa runs 24/7, so don't count on staff being offline to save you.",
"",
"**3. Keep it clean** 🔞",
"NSFW, gore, or anything excessively graphic doesn't belong in the archive. Take it somewhere else.",
"",
"**4. Got beef? Keep it private** 🎫",
"Got a problem with someone? Don't turn public chat into a battlefield. Open `/ticket` or handle it privately. We don't need unnecessary drama around here.",
"",
"**5. Know your channel** 📍",
"Every channel has its purpose. Take a second to see where you are before dropping your message. Simple.",
"",
"**6. No raids, no alt armies** ⚔️",
"Here to raid, spam, or flood the server with suspicious accounts? Our Anti Raid system will handle the rest. Suspicious accounts may be kicked automatically.",
"",
"**7. Staff makes the call** 👑",
"Don't agree with a staff decision? That's fine. Open a ticket and talk it through. What isn't fine is turning public chat into an argument or spamming staff DMs.",
"",
"**8. Don't wear someone else's identity** 🎭",
"Impersonating staff, members, or anyone else to scam, manipulate, or gain something from others is a serious violation.",
"",
"**9. Speak your language, keep your manners** 🗣️",
"Indonesian, English, or a mix of both, you're good. Just know where the line is and don't use your words to make someone else's space miserable.",
"",
"**10. Every action leaves a record** ⚖️",
"Violation → Warn with a case number → Mute → Kick → Ban if it keeps happening or the situation calls for it. Everything is logged so moderation stays clear and fair.",
"",
"**11. 13+ only**",
"You need to be at least 13. That's Discord's age requirement, and we're sticking to it.",
"",
"That's the code. Now get back to the game, find your people, and have a good time. Keep the attitude clean, keep the archive alive. See you around. 🎮"
            ].join("\n"))
            .setImage("https://cdn.discordapp.com/attachments/1406140289344602192/1543969057676595300/ENG_RULES.png?ex=6a96ccbc&is=6a957b3c&hm=52a7e5dfa581a0f583cd6e1fedf774e45a1e622af8f032bd780dc14396ce374b&")
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
