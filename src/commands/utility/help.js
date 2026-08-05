import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

// ==========================
// Konten per bahasa — nambah command baru cukup tambah baris
// di kedua bahasa. `sections` selalu kelihatan, `staff` cuma buat yang
// punya izin moderasi (Moderate/Kick/Ban Members), `admin` cuma buat
// Administrator.
// ==========================

const CONTENT = {

    id: {
        title: "Vexa Asteria — Panduan",
        sections: [
            {
                title: "📈 Progression",
                lines: [
                    "`/profile` — kartu profil kamu (animated; `static:true` untuk cepat)",
                    "`/level` — level, XP, dan rank kamu",
                    "`/leaderboard` — top member (kartu podium; `page` / `list:true` untuk daftar)",
                    "`/daily` — klaim XP & Shards harian, jaga streak-mu! (reset 00:00 WIB)"
                ]
            },
            {
                title: "💎 Economy",
                lines: [
                    "`/balance` — cek saldo Shards",
                    "`/shop` — lihat katalog theme profile card",
                    "`/buy` — beli item (theme langsung terpasang)",
                    "`/theme` — ganti-ganti theme yang sudah kamu miliki"
                ]
            },
            {
                title: "✨ Cara dapat Shards",
                lines: [
                    "Klaim `/daily` tiap hari — streak nambah bonusnya",
                    "Naik level dari aktif chat (level × 10 💎)",
                    "Event & giveaway dari admin"
                ]
            },
            {
                title: "🎫 Butuh Bantuan / Jasa?",
                lines: [
                    "Buka tiket lewat tombol **Open Ticket** di channel ticket — pilih kategori (Design, Dev, Cinematic, Complain, General)",
                    "Tiket jasa (Design/Dev/Cinematic) yang selesai bakal di-DM minta rating ⭐ — hasilnya masuk channel testimonial",
                    "`/suggest` — kasih ide buat server, komunitas bisa vote 👍👎",
                    "`/invites` `/invites-leaderboard` — cek/lihat siapa paling banyak ngundang member"
                ]
            }
        ],
        staff: {
            title: "🛡️ Staff (izin moderasi)",
            lines: [
                "`/warn` `/warnings` `/warning-remove` — kasih/lihat/hapus warning",
                "`/mute` `/unmute` — timeout member (maks 28 hari)",
                "`/kick` `/ban` `/unban` — aksi moderasi standar",
                "`/case` — lihat detail satu case moderasi by nomor",
                "`/raid-status` `/raid-clear` — cek/matiin mode waspada Anti-Raid",
                "`/ticket-status` — update progres tiket (In Progress/Awaiting Payment/Completed), jalanin di dalam channel tiket"
            ]
        },
        admin: {
            title: "🛠️ Admin — Setup Server",
            lines: [
                "`/verify-setup` `/roles-setup` `/faq-setup` `/rules-setup` — panel server",
                "`/ticket-setup` — panel ticket + role staff, kategori channel, log",
                "`/suggestion-setup` — channel tujuan `/suggest`",
                "`/testimonial-setup` — channel tujuan review klien",
                "`/automod-setup` `/modlog-setup` — channel laporan AutoMod & mod-log",
                "`/creator-review-setup` — channel review aplikasi content creator",
                "`/lofi-setup` — voice channel jam Lofi Radio (WIB)",
                "`/level-roles-setup` `/level-role-add` `/level-role-remove` `/level-roles` — role reward per level"
            ]
        },
        adminTools: {
            title: "🛠️ Admin — Tools",
            lines: [
                "`/sync-rewards` — apply role reward level ke semua member",
                "`/give-shards` — beri/kurangi Shards member",
                "`/remove-initiate` — lepas role Initiate massal",
                "`/stats` — statistik aktivitas & economy server"
            ]
        }
    },

    en: {
        title: "Vexa Asteria — Guide",
        sections: [
            {
                title: "📈 Progression",
                lines: [
                    "`/profile` — your profile card (animated; `static:true` for speed)",
                    "`/level` — your level, XP, and rank",
                    "`/leaderboard` — top members (podium card; `page` / `list:true` for text)",
                    "`/daily` — claim daily XP & Shards, keep your streak! (resets 00:00 WIB)"
                ]
            },
            {
                title: "💎 Economy",
                lines: [
                    "`/balance` — check your Shards balance",
                    "`/shop` — browse profile card themes",
                    "`/buy` — buy an item (themes equip instantly)",
                    "`/theme` — switch between themes you own"
                ]
            },
            {
                title: "✨ How to earn Shards",
                lines: [
                    "Claim `/daily` every day — streaks boost the bonus",
                    "Level up by chatting (level × 10 💎)",
                    "Admin events & giveaways"
                ]
            },
            {
                title: "🎫 Need Help / Services?",
                lines: [
                    "Open a ticket via the **Open Ticket** button in the ticket channel — pick a category (Design, Dev, Cinematic, Complain, General)",
                    "Finished service tickets (Design/Dev/Cinematic) get a DM asking for a ⭐ rating — results go to the testimonial channel",
                    "`/suggest` — share an idea for the server, the community can vote 👍👎",
                    "`/invites` `/invites-leaderboard` — check/see who's invited the most members"
                ]
            }
        ],
        staff: {
            title: "🛡️ Staff (moderation permissions)",
            lines: [
                "`/warn` `/warnings` `/warning-remove` — issue/view/revoke warnings",
                "`/mute` `/unmute` — timeout a member (max 28 days)",
                "`/kick` `/ban` `/unban` — standard moderation actions",
                "`/case` — look up one moderation case by number",
                "`/raid-status` `/raid-clear` — check/end Anti-Raid alert mode",
                "`/ticket-status` — update order progress (In Progress/Awaiting Payment/Completed), run inside a ticket channel"
            ]
        },
        admin: {
            title: "🛠️ Admin — Server Setup",
            lines: [
                "`/verify-setup` `/roles-setup` `/faq-setup` `/rules-setup` — server panels",
                "`/ticket-setup` — ticket panel + staff role, channel category, log",
                "`/suggestion-setup` — destination channel for `/suggest`",
                "`/testimonial-setup` — destination channel for client reviews",
                "`/automod-setup` `/modlog-setup` — AutoMod & mod-log report channels",
                "`/creator-review-setup` — content creator application review channel",
                "`/lofi-setup` — Lofi Radio voice channel clock (WIB)",
                "`/level-roles-setup` `/level-role-add` `/level-role-remove` `/level-roles` — per-level role rewards"
            ]
        },
        adminTools: {
            title: "🛠️ Admin — Tools",
            lines: [
                "`/sync-rewards` — apply level role rewards to all members",
                "`/give-shards` — give/deduct a member's Shards",
                "`/remove-initiate` — bulk-remove the Initiate role",
                "`/stats` — server activity & economy statistics"
            ]
        }
    }

};

/** Bahasa efektif: opsi user > locale Discord si pemanggil > English. */
function resolveLanguage(interaction) {

    const chosen = interaction.options.getString("language");
    if (chosen) return chosen;

    return interaction.locale?.startsWith("id") ? "id" : "en";

}

export default {

    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("All Vexa Asteria features in one place.")
        .addStringOption(option =>
            option
                .setName("language")
                .setDescription("Guide language (default: follows your Discord language).")
                .setRequired(false)
                .addChoices(
                    { name: "Bahasa Indonesia", value: "id" },
                    { name: "English", value: "en" }
                )
        ),

    async execute(interaction) {

        const lang = resolveLanguage(interaction);
        const content = CONTENT[lang];

        const perms = interaction.memberPermissions;
        const isAdmin = perms?.has(PermissionFlagsBits.Administrator) ?? false;

        // Staff = punya izin moderasi apa aja (bukan cuma Administrator) —
        // Moderation Suite sengaja pakai izin granular (Moderate/Kick/Ban
        // Members) biar role "Moderator" tanpa full admin tetap kepakai,
        // jadi /help juga harus ngikutin logika yang sama.
        const isStaff = isAdmin
            || Boolean(perms?.has(PermissionFlagsBits.ModerateMembers))
            || Boolean(perms?.has(PermissionFlagsBits.KickMembers))
            || Boolean(perms?.has(PermissionFlagsBits.BanMembers));

        const sections = [...content.sections];

        if (isStaff) sections.push(content.staff);
        if (isAdmin) sections.push(content.admin, content.adminTools);

        const description = sections
            .map(s => [`**${s.title}**`, ...s.lines].join("\n"))
            .join("\n\n");

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(content.title)
            .setDescription(description)
            .setFooter(EMBED_FOOTER);

        // Ephemeral biar ga menuhin channel — tiap orang lihat versinya sendiri.
        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });

    }

};
