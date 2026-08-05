// Conservative: 10 member join dalam 30 detik dianggap raid — cocok
// buat server yang kadang emang rame joinnya (event/promo).
export const RAID_JOIN_THRESHOLD = 10;
export const RAID_WINDOW_MS = 30 * 1000;

// Begitu raid ke-trigger, Vexa tetap "waspada" 5 menit — member baru
// yang join di periode ini langsung dicek juga, ga perlu nunggu
// threshold ke-hit ulang.
export const RAID_MODE_DURATION_MS = 5 * 60 * 1000;

// Akun Discord di bawah umur ini dianggap "baru" — pola khas bot raid
// yang akunnya baru dibikin sesaat sebelum dipakai.
export const NEW_ACCOUNT_AGE_MS = 7 * 24 * 60 * 60 * 1000;
