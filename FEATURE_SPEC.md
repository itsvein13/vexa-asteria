# /profile

Purpose

Components

Database

Future Plan

---

# /verify

---

# /level

---

# /daily

---

# /leaderboard

---

# /roles-setup (role menu)

- Games: pilih maksimal **3**.
- Vibes: pilih maksimal **2** (minimal 1).
- Content Creator ("Yes, I'm a Streamer"): TIDAK langsung dapat role. Alur verifikasi:
  1. Member pilih opsi → muncul modal minta link akun (YouTube/Twitch/TikTok/dsb).
  2. Link tersimpan (tabel `creator_applications`, status `pending`) dan dikirim sebagai embed ke channel review (`/creator-review-setup`) dengan tombol **Approve** / **Reject**.
  3. Staff dengan izin **Manage Roles** klik salah satu — role **Streamer** baru diberikan setelah Approve. Keputusan bersifat sekali (guard anti dobel-klik dari dua staff).
  4. Member dapat DM hasilnya (best-effort). Setelah reject, member bisa apply ulang dengan link baru.
- "Just here to hang out": tetap langsung dapat role Human Being, tanpa verifikasi (risiko rendah).

---

# AutoMod: Cross-Post Spam Detection

Purpose: nangkep pola self-bot/akun ke-compromise yang nyepam giveaway palsu (foto Elon Musk, MrBeast, dsb) ke banyak channel sekaligus.

- Deteksi: pesan **identik** (teks + lampiran + link) dari user yang sama, dikirim ke **≥3 channel berbeda dalam ≤10 detik**. Angka ini diatur di `config/antiSpamRules.js`.
- Hanya pesan yang punya **link atau lampiran** yang dilacak — teks polos berulang (mis. "lol" di banyak channel) sengaja diabaikan biar risiko salah tangkap rendah.
- Tracking di memori (bukan database) — sesaat, ringan, otomatis tersapu.
- Begitu terdeteksi: pesan-pesan bukti dihapus, member **di-ban** (+ pesan 1 jam terakhirnya ikut dibersihkan), dan laporan lengkap (isi pesan, channel, ID user) dikirim ke channel log — supaya bisa di-unban manual dengan konteks penuh kalau ternyata salah deteksi.
- Setup: `/automod-setup log:<channel>` (admin). Butuh izin bot **Manage Messages** + **Ban Members**.
- Pelengkap, bukan pengganti: aktifkan juga **Discord AutoMod bawaan** (Server Settings → Safety Setup) untuk filter link/kata kunci/mass-mention — Vexa fokus di pola lintas-channel yang tidak bisa dideteksi AutoMod native.

---

# Moderation Suite

Purpose: toolkit manual buat staff (warn/mute/kick/ban) yang melengkapi AutoMod — AutoMod nangkep spam otomatis, ini buat kasus yang perlu keputusan manusia. Semua aksi tercatat sebagai **case** bernomor urut per-server, bisa ditelusuri kapan saja lewat `/case`.

Commands:
- `/modlog-setup log:<channel>` (Administrator) — atur channel laporan mod-log.
- `/warn member:<user> reason:<text>` — catat warning (case baru + DM ke member, best-effort).
- `/warnings member:<user>` — daftar warning **aktif** milik satu member (ephemeral).
- `/warning-remove case:<number>` — soft-delete satu warning (histori tetap ada di database, cuma ga lagi dihitung "aktif").
- `/mute member:<user> duration:<10m|1h|7d|...> reason:<text>` — timeout native Discord, maks 28 hari (batas Discord sendiri). Format durasi: angka + s/m/h/d/w.
- `/unmute member:<user> reason:<text>` — lepas timeout sebelum waktunya.
- `/kick member:<user> reason:<text>`
- `/ban member:<user> reason:<text> delete_messages:<none|1h|6h|1d|3d|7d>` — bisa dipakai walau member sudah keluar server.
- `/unban user_id:<id> reason:<text>` — pakai User ID (Developer Mode → Copy User ID), karena user yang di-ban ga muncul di user-picker biasa.
- `/case number:<number>` — lihat detail satu case (siapa, moderator, alasan, durasi kalau ada).

Permission model — sengaja **granular**, bukan cuma "Administrator" seperti command admin lain, supaya server bisa kasih role "Moderator" akses tanpa full admin:
- `/warn`, `/warnings`, `/warning-remove`, `/mute`, `/unmute`, `/case` → butuh **Moderate Members**.
- `/kick` → butuh **Kick Members**.
- `/ban`, `/unban` → butuh **Ban Members**.
- `/modlog-setup` tetap **Administrator** (setup, bukan aksi harian).

Guard bawaan tiap aksi (fungsi `canModerate` di `utils/modLog.js`):
- Ga bisa moderasi diri sendiri, Vexa sendiri, atau owner server.
- Role staff yang menjalankan command harus lebih tinggi dari role target (bypass kalau staff itu owner/Administrator).
- Role **Vexa** juga harus lebih tinggi dari role target di Server Settings → Roles — dicek duluan biar errornya jelas, bukan error mentah dari Discord API.

Database: tabel `mod_cases` (satu baris per aksi, nomor case unik per guild, kolom `status` buat soft-delete warning) dan `mod_log_config` (channel laporan per guild).
