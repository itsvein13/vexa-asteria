/**
 * Aturan deteksi cross-post spam — satu tempat untuk semua angka
 * tuning-nya, ga usah bongkar logika di utils/antiSpam.js.
 *
 * Ciri khas yang dideteksi: pesan IDENTIK (teks/lampiran/link sama)
 * dikirim akun yang sama ke banyak channel berbeda dalam waktu
 * singkat — pola khas self-bot / akun ke-compromise yang nyepam
 * giveaway palsu (foto Elon Musk, MrBeast, dsb).
 */

// Berapa channel berbeda dengan pesan identik dalam window ini
// baru dianggap spam. Rendah = lebih sensitif, lebih berisiko
// salah tangkap member yang kebetulan cross-post hal sah.
export const CROSS_POST_CHANNEL_THRESHOLD = 3;

// Jendela waktu (ms) untuk menghitung cross-post di atas.
export const CROSS_POST_WINDOW_MS = 10 * 1000;

// Seberapa sering Map tracking di-sapu dari entri basi, biar ga
// numpuk di memori kalau bot uptime lama.
export const TRACKING_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
