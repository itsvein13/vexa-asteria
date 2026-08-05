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
