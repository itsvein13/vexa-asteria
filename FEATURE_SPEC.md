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
