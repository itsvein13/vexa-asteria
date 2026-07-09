import db from "./db.js";

const getStmt = db.prepare(
    "SELECT active_theme FROM profile_settings WHERE user_id = ? AND guild_id = ?"
);

const setStmt = db.prepare(`
    INSERT INTO profile_settings (user_id, guild_id, active_theme)
    VALUES (@userId, @guildId, @theme)
    ON CONFLICT(user_id, guild_id)
    DO UPDATE SET active_theme = @theme
`);

/** Theme aktif member ('default' kalau belum pernah set). */
export function getActiveTheme(userId, guildId) {
    return getStmt.get(userId, guildId)?.active_theme ?? "default";
}

export function setActiveTheme(userId, guildId, theme) {
    setStmt.run({ userId, guildId, theme });
}
