import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} from "discord.js";

import { EMBED_COLOR, EMBED_FOOTER } from "../../config/constants.js";

// ==========================
// Konten per bahasa — nambah command baru cukup tambah baris
// di kedua bahasa.
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
            }
        ],
        admin: {
            title: "🛠️ Admin",
            lines: [
                "`/verify-setup` `/roles-setup` `/faq-setup` — panel server",
                "`/sync-rewards` — apply role reward level ke semua member",
                "`/give-shards` — beri/kurangi Shards member",
                "`/remove-initiate` — lepas role Initiate massal"
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
            }
        ],
        admin: {
            title: "🛠️ Admin",
            lines: [
                "`/verify-setup` `/roles-setup` `/faq-setup` — server panels",
                "`/sync-rewards` — apply level role rewards to all members",
                "`/give-shards` — give/deduct a member's Shards",
                "`/remove-initiate` — bulk-remove the Initiate role"
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

        const isAdmin = interaction.memberPermissions?.has(
            PermissionFlagsBits.Administrator
        ) ?? false;

        const sections = isAdmin
            ? [...content.sections, content.admin]
            : content.sections;

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
