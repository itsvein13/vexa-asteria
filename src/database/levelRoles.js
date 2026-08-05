import db from "./db.js";

const listStmt = db.prepare(
    "SELECT level, role_id, label FROM level_roles WHERE guild_id = ? ORDER BY level ASC"
);

const insertStmt = db.prepare(`
    INSERT INTO level_roles (guild_id, level, role_id, label)
    VALUES (@guildId, @level, @roleId, @label)
`);

const deleteStmt = db.prepare(
    "DELETE FROM level_roles WHERE guild_id = ? AND level = ?"
);

const existsStmt = db.prepare(
    "SELECT 1 FROM level_roles WHERE guild_id = ? AND level = ?"
);

/** Tangga level role server ini, terurut naik. */
export function getLevelRoles(guildId) {
    return listStmt.all(guildId).map(row => ({
        level: row.level,
        roleId: row.role_id,
        label: row.label
    }));
}

export function levelRoleExists(guildId, level) {
    return existsStmt.get(guildId, level) !== undefined;
}

/**
 * Daftarkan role reward baru untuk sebuah level.
 * Gagal (return false) kalau level itu sudah dipetakan —
 * caller diminta /level-role-remove dulu supaya role Discord lama
 * tidak diam-diam jadi yatim tanpa sepengetahuan admin.
 */
export function addLevelRole(guildId, level, roleId, label) {

    if (levelRoleExists(guildId, level)) return false;

    insertStmt.run({ guildId, level, roleId, label });
    return true;

}

/** Lepas mapping level (role Discord-nya TIDAK dihapus, cuma di-unlink). */
export function removeLevelRole(guildId, level) {
    return deleteStmt.run(guildId, level).changes > 0;
}
