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

# Ticket System

Purpose: channel privat 1-on-1 antara member dan staff, dengan kategori kebutuhan biar staff langsung tau ini soal apa sebelum buka channel-nya.

- `/ticket-setup staff:<role> category:<kategori channel> log:<channel>` (Administrator) — kirim panel "Open Ticket" ke channel yang dipilih.
- Alur member: klik **Open Ticket** → pilih salah satu kategori dari select menu → channel privat otomatis dibuat (cuma kelihatan member itu + role staff + Vexa), dinomori urut per-server (`ticket-0001`, dst).
- Kategori tiket (`config/ticketCategories.js` — gampang ditambah/diubah):
  1. 🎨 **Design & Video Editing** — Video Editing, Graphic, Clothing, UI/UX Design
  2. 💻 **Web & App Development** — Web Programming, SaaS, Mobile Apps
  3. 🎬 **FiveM & NFS Cinematic** — Cinematic, Foto, dan Editing Include
  4. ⚠️ **Complain** — keluhan atau laporan masalah
  5. 💬 **General Inquiry** — pertanyaan umum, partnership, atau hal lain di luar 4 kategori atas (kategori tambahan biar ga ada member yang kepaksa milih kategori yang salah)
- Kategori yang dipilih kelihatan di topic channel dan embed pembuka tiket, jadi staff langsung ngerti konteksnya tanpa nanya ulang.
- Satu member cuma boleh punya satu tiket aktif dalam satu waktu (dicek dua kali: pas klik Open Ticket dan pas pilih kategori, buat jaga-jaga race condition).
- `/ticket-close` (tombol di channel tiket) — cuma pembuat tiket atau staff yang bisa menutup. Transcript (sampai 500 pesan terakhir) diarsipkan sebagai file `.txt` dan dikirim ke log channel bareng info kategori, lalu channel-nya otomatis terhapus.
- Database: tabel `tickets` (nomor urut per-guild, kategori, status) dan `ticket_config` (role staff, kategori channel, log channel per-guild). Instalasi lama yang tiket-nya udah jalan sebelum fitur kategori ini otomatis ter-migrasi (kolom `category` ditambahkan tanpa data lama hilang, tiket lama cuma kategori-nya kosong).

---

# Ticket Order Status

Purpose: staff bisa nandain progres pengerjaan tiket jasa tanpa harus ngetik manual tiap kali klien nanya "udah sampe mana".

- `/ticket-status status:<pilihan>` — dijalankan **di dalam channel tiket** yang masih aktif, staff-only (role staff yang sama kayak `/ticket-setup`, bukan permission Discord — jadi ga muncul di command picker Administrator, cek-nya di runtime).
- Pilihan status: 🔧 **In Progress**, 💰 **Awaiting Payment**, ✅ **Completed**, atau ↩️ **Reset** (balikin ke belum diproses).
- Begitu diset: topic channel otomatis keupdate (`🔧 In Progress — Ticket #0007`) dan ada pesan konfirmasi di channel. Update topic sengaja pakai `setTopic`, **bukan** rename nama channel (`setName`) — rename channel kena rate limit ketat Discord (2x/10 menit), sama masalah yang pernah ditemui di fitur Lofi Radio clock.
- Status terakhir tiket ikut tercatat di log waktu tiket ditutup (`/ticket-close`), jadi ada jejak progres di histori.
- Terpisah dari status buka/tutup tiket (kolom database beda: `order_status` vs `status`) — reset atau ganti status jasa ga akan bikin tiket keanggep tertutup atau kebuka lagi.
- Database: kolom `order_status` di tabel `tickets` (auto-migrasi buat instalasi lama, sama pola kayak migrasi `category`).

---

# Client Testimonials

Purpose: bukti sosial buat jasa yang dijual di server (Design, Web/App Dev, FiveM/NFS Cinematic) — calon klien baru bisa liat review asli sebelum order.

- `/testimonial-setup channel:<channel>` (Administrator) — atur channel tujuan review.
- Begitu tiket dari kategori **jasa berbayar** (Design, Programming, Cinematic — bukan Complain/General, karena aneh minta bintang 5 abis komplain) ditutup, Vexa otomatis DM pembuat tiket: "Gimana pengalaman kamu?" dengan 5 tombol rating (⭐ sampai ⭐⭐⭐⭐⭐).
- Klik salah satu rating → muncul modal buat testimoni tertulis (opsional, maks 500 karakter) → begitu submit, review diposting sebagai embed ke channel testimonial (rating bintang, komentar, kategori jasa, nomor tiket, avatar+nama pengulas).
- Satu tiket cuma bisa direview sekali (guard di database, submit kedua otomatis ditolak) — dan tiket kategori Complain/General ga pernah dapat DM permintaan review sama sekali.
- DM adalah best-effort — kalau DM klien tertutup, itu tercatat di log penutupan tiket (`⚠️ DM permintaan review gagal terkirim`) biar staff tau perlu follow-up manual kalau mau.
- Database: tabel `testimonials` (satu baris per tiket, guard anti-dobel-submit) dan `testimonial_config` (channel per guild).

---

# /my-orders

Purpose: klien bisa lihat histori tiket mereka sendiri kapan aja — sebelumnya begitu channel tiket kehapus, gak ada cara liat lagi order lama.

- `/my-orders` — tampilin 10 tiket terbaru milik pemanggil: nomor, kategori, status (terbuka + progres saat ini, atau ditutup + kapan), dan rating ⭐ yang mereka kasih kalau ada.
- `/my-orders member:<user>` — cek histori member lain, dibatasi staff tiket aja (role staff yang sama dengan `/ticket-setup`).
- Ephemeral — cuma pemanggil yang lihat.

---

# /stats (diperluas)

Section **🎫 Tickets** ditambahin ke `/stats` yang udah ada (Administrator), biar semua statistik server ada di satu tempat:

- Total tiket & yang masih terbuka.
- Breakdown per kategori (Design/Dev/Cinematic/Complain/General).
- Top 5 staff berdasarkan jumlah tiket yang ditutup.
- Rata-rata rating testimonial + total review.

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

---

# Suggestion Box

Purpose: jalur resmi buat member kasih masukan ke server, dengan alur triase yang jelas buat staff (bukan sekadar numpuk di satu channel).

- `/suggestion-setup channel:<channel>` (Administrator) — atur channel tujuan.
- `/suggest idea:<text>` — semua member bisa pakai (ga ada batasan permission). Setiap suggestion dapat nomor urut per-server (`#1`, `#2`, ...) dan diposting sebagai embed ke channel yang dikonfigurasi.
- Voting komunitas: bot otomatis kasih reaksi 👍👎 di pesannya — vote count kelihatan langsung dari reaksinya, ga perlu command tambahan.
- Alur status: **pending → approved/rejected**, lalu **approved → implemented**. Staff (izin **Manage Messages**) klik tombol Approve/Reject di pesan; kalau Approved, tombol berubah jadi "Mark Implemented" buat ditandai belakangan. Reject/Implemented = status akhir, tombol dilepas.
- Setiap transisi status di-guard atomik di database (anti dobel-klik dua staff) dan pengusul dapat DM best-effort soal keputusannya.
- Database: `suggestions` (satu baris per suggestion, nomor + status + siapa yang review) dan `suggestion_config` (channel per guild).

---

# Invite Tracker

Purpose: tau siapa invite siapa, buat lihat/reward member yang paling bantu growth server. Otomatis jalan begitu bot online — ga perlu command setup.

- `/invites member:<user>` — invite aktif, total pernah join, dan yang sudah keluar lagi milik satu member (default: diri sendiri).
- `/invites-leaderboard` — top 10 inviter berdasarkan invite **aktif**.
- "Aktif" = member yang join lewat invite orang itu dan **masih ada di server**. Kalau yang diundang keluar lagi, invite itu ga lagi dihitung buat si inviter — mencegah kredit dari akun alt yang invite-lalu-leave. Kalau dia join lagi (lewat invite manapun), kreditnya otomatis pindah ke inviter yang baru.
- Cara kerja: bot cache snapshot semua invite guild (uses count) waktu online, lalu di-diff tiap ada member baru join buat tau invite mana yang barusan kepake. Termasuk nangani kasus invite sekali-pakai yang otomatis kehapus Discord pas dipakai, dan invite dari Vanity URL (kalau guild punya fiturnya).
- **Butuh izin bot Manage Server** — tanpa itu, bot tetap tracking join/leave tapi ga bisa identifikasi siapa inviter-nya (invite tercatat dengan inviter kosong).
- Database: `invite_uses` (satu baris per member yang pernah join, di-upsert kalau keluar-masuk lagi).

---

# Anti-Raid Protection

Purpose: deteksi lonjakan join massal (bot raid) dan otomatis kick akun-akun mencurigakan sebelum sempat spam/scam channel. Melengkapi AutoMod (yang fokus ke pola pesan) dari sisi join-gate. Ga perlu command setup terpisah — otomatis aktif begitu bot online, dan laporannya dikirim ke channel yang sama dengan AutoMod (`/automod-setup`).

- Threshold: **10 member join dalam 30 detik** (preset Conservative — dipilih biar server yang emang kadang rame joinnya, misal abis event/promo, ga kena salah deteksi).
- Begitu ke-trigger, Vexa masuk **mode waspada selama 5 menit** — bukan cuma gelombang awal yang dicek, tiap member baru yang join selama periode itu juga otomatis dievaluasi tanpa perlu threshold ke-hit ulang.
- Aksi: member (baik dari gelombang awal maupun yang join selama mode waspada) dengan **akun Discord di bawah 7 hari** otomatis **di-kick** — pola khas bot raid yang akunnya baru dibikin sesaat sebelum dipakai. Member dengan akun lebih tua dibiarkan, cuma dicatat di laporan (gelombang awal) tanpa tindakan.
- Setiap trigger mengirim laporan lengkap ke mod-log: daftar member, umur akun masing-masing, dan berapa yang di-kick. Auto-kick individual selama mode waspada juga dilog ringkas.
- `/raid-status` (izin **Kick Members**) — cek apakah mode waspada sedang aktif dan sisa waktunya.
- `/raid-clear` (izin **Kick Members**) — safety valve: matikan mode waspada manual kalau ternyata false positive (misal emang lagi ada growth spurt asli), biar member baru berhenti ke-auto-kick.
- Trade-off yang perlu disadari: auto-kick berdasarkan umur akun **bisa salah kena** member baru asli yang kebetulan join bareng waktu gelombang itu. Ini pilihan sadar (bukan default paling aman) — kalau mau nol risiko, `/raid-clear` selalu tersedia buat stop secepatnya, dan ke depannya threshold/aksi bisa diubah lagi kalau perlu.
