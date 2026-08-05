import db from "./db.js";

const getStmt = db.prepare(
    "SELECT log_channel_id FROM mod_log_config WHERE guild_id = ?"
);

const setStmt = db.prepare(`
    INSERT INTO mod_log_config (guild_id, log_channel_id)
    VALUES (@guildId, @channelId)
    ON CONFLICT(guild_id)
    DO UPDATE SET log_channel_id = @channelId
`);

export function getModLogChannel(guildId) {
    return getStmt.get(guildId)?.log_channel_id ?? null;
}

export function setModLogChannel(guildId, channelId) {
    setStmt.run({ guildId, channelId });
}
