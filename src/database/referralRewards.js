import db from "./db.js";

// ===== Milestones (konfigurasi tangga) =====

const listStmt = db.prepare(
    "SELECT threshold, reward, label FROM referral_milestones WHERE guild_id = ? ORDER BY threshold ASC"
);

const insertStmt = db.prepare(`
    INSERT INTO referral_milestones (guild_id, threshold, reward, label)
    VALUES (@guildId, @threshold, @reward, @label)
`);

const deleteStmt = db.prepare(
    "DELETE FROM referral_milestones WHERE guild_id = ? AND threshold = ?"
);

const existsStmt = db.prepare(
    "SELECT 1 FROM referral_milestones WHERE guild_id = ? AND threshold = ?"
);

/** Tangga milestone referral server ini, terurut naik. */
export function getMilestones(guildId) {
    return listStmt.all(guildId).map(row => ({
        threshold: row.threshold,
        reward: row.reward,
        label: row.label
    }));
}

export function milestoneExists(guildId, threshold) {
    return existsStmt.get(guildId, threshold) !== undefined;
}

/**
 * Daftarkan milestone baru. Gagal (return false) kalau threshold itu
 * sudah dipetakan — caller diminta /referral-milestone-remove dulu,
 * pola sama persis dengan addLevelRole di database/levelRoles.js.
 */
export function addMilestone(guildId, threshold, reward, label) {

    if (milestoneExists(guildId, threshold)) return false;

    insertStmt.run({ guildId, threshold, reward, label });
    return true;

}

/** Lepas satu milestone dari tangga. Klaim yang sudah terjadi TIDAK ditarik balik. */
export function removeMilestone(guildId, threshold) {
    return deleteStmt.run(guildId, threshold).changes > 0;
}

// ===== Claims (siapa sudah dapat milestone mana) =====

const claimedStmt = db.prepare(
    "SELECT threshold FROM referral_claims WHERE guild_id = ? AND user_id = ?"
);

/** Set threshold yang sudah pernah diklaim member ini (Set<number>). */
export function getClaimedThresholds(guildId, userId) {
    return new Set(claimedStmt.all(guildId, userId).map(row => row.threshold));
}

const claimStmt = db.prepare(`
    INSERT OR IGNORE INTO referral_claims (guild_id, user_id, threshold, claimed_at)
    VALUES (@guildId, @userId, @threshold, @claimedAt)
`);

/**
 * Klaim satu milestone buat member ini — atomik lewat INSERT OR IGNORE
 * + PRIMARY KEY (guild_id, user_id, threshold), jadi aman dipanggil
 * berbarengan (mis. guildMemberAdd dan /referral-sync race). Balikin
 * true kalau ini klaim baru (reward harus diberikan), false kalau
 * sudah pernah diklaim sebelumnya.
 */
export function claimMilestone(guildId, userId, threshold) {
    return claimStmt.run({ guildId, userId, threshold, claimedAt: Date.now() }).changes > 0;
}
