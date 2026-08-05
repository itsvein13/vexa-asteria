import db from "./db.js";
import { computeLevel } from "./levels.js";
import { wibDayKey } from "./daily.js";
import { getTestimonialSummary } from "./testimonials.js";

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Timestamp (ms) awal hari WIB ke-`daysAgo` dari sekarang. */
function startOfWibDay(daysAgo = 0, now = Date.now()) {
    return (wibDayKey(now) - daysAgo) * DAY_MS - WIB_OFFSET_MS;
}

const levelStats = db.prepare(`
    SELECT COUNT(*) AS members, COALESCE(SUM(xp), 0) AS totalXP,
           COALESCE(MAX(xp), 0) AS topXP
    FROM levels WHERE guild_id = ?
`);

const claimsSince = db.prepare(`
    SELECT COUNT(*) AS claims FROM daily
    WHERE guild_id = ? AND last_claim_at >= ?
`);

const streakStats = db.prepare(`
    SELECT COUNT(*) AS active, COALESCE(MAX(streak), 0) AS longest
    FROM daily
    WHERE guild_id = ? AND streak >= 2 AND last_claim_at >= ?
`);

const economyStats = db.prepare(`
    SELECT COALESCE(SUM(balance), 0) AS circulating,
           COALESCE(MAX(balance), 0) AS richest,
           COUNT(*) AS holders
    FROM economy WHERE guild_id = ? AND balance > 0
`);

const salesStats = db.prepare(`
    SELECT item_id, COUNT(*) AS sold
    FROM inventory WHERE guild_id = ?
    GROUP BY item_id ORDER BY sold DESC
`);

const ticketTotals = db.prepare(`
    SELECT COUNT(*) AS total,
           COALESCE(SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END), 0) AS open
    FROM tickets WHERE guild_id = ?
`);

const ticketsByCategory = db.prepare(`
    SELECT category, COUNT(*) AS count
    FROM tickets WHERE guild_id = ? AND category IS NOT NULL
    GROUP BY category ORDER BY count DESC
`);

const topStaffByClosed = db.prepare(`
    SELECT closed_by, COUNT(*) AS closed
    FROM tickets
    WHERE guild_id = ? AND status = 'closed' AND closed_by IS NOT NULL
    GROUP BY closed_by ORDER BY closed DESC LIMIT 5
`);

/**
 * Snapshot statistik server untuk /stats.
 * Semua angka dihitung on-demand — dataset komunitas masih kecil,
 * belum perlu caching.
 */
export function getServerStats(guildId, now = Date.now()) {

    const lv = levelStats.get(guildId);
    const eco = economyStats.get(guildId);

    // Streak "hidup" = pernah beruntun >= 2 hari dan masih bisa
    // dilanjut (klaim terakhir kemarin atau hari ini).
    const streaks = streakStats.get(guildId, startOfWibDay(1, now));

    return {

        members: lv.members,
        totalXP: lv.totalXP,
        topLevel: computeLevel(lv.topXP).level,

        claimsToday: claimsSince.get(guildId, startOfWibDay(0, now)).claims,
        claimsWeek: claimsSince.get(guildId, startOfWibDay(6, now)).claims,

        activeStreaks: streaks.active,
        longestStreak: streaks.longest,

        circulating: eco.circulating,
        richest: eco.richest,
        holders: eco.holders,

        sales: salesStats.all(guildId),

        tickets: {
            ...ticketTotals.get(guildId),
            byCategory: ticketsByCategory.all(guildId),
            topStaff: topStaffByClosed.all(guildId),
            testimonials: getTestimonialSummary(guildId)
        }

    };

}
