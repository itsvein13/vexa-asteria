/**
 * Aturan earning Shards — satu tempat untuk semua angka economy.
 * Ubah balance game-nya di sini, bukan di command.
 */

export const DAILY_BASE_SHARDS = 50;
export const DAILY_SHARD_STREAK_BONUS = 5;   // per hari streak (mulai hari ke-2)
export const DAILY_SHARD_STREAK_CAP = 7;     // mentok +35

/** Shards dari /daily untuk streak tertentu. Hari 1 = 50, hari 8+ = 85. */
export function dailyShards(streak) {
    const bonusDays = Math.min(Math.max(streak - 1, 0), DAILY_SHARD_STREAK_CAP);
    return DAILY_BASE_SHARDS + bonusDays * DAILY_SHARD_STREAK_BONUS;
}

/** Bonus Shards saat naik level — makin tinggi level makin besar. */
export function levelUpShards(level) {
    return level * 10;
}
