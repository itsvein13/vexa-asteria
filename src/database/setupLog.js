import db from "./db.js";

// Buat panel yang ga punya tabel config sendiri (verify-setup, roles-setup,
// faq-setup, rules-setup — cuma kirim embed sekali, ga ada channel/role
// yang perlu disimpan), setup_log ini satu-satunya cara /setup-status
// tau apa command itu sudah pernah dijalankan atau belum.

const recordStmt = db.prepare(`
    INSERT INTO setup_log (guild_id, setup_key, last_run_at)
    VALUES (@guildId, @setupKey, @lastRunAt)
    ON CONFLICT(guild_id, setup_key)
    DO UPDATE SET last_run_at = @lastRunAt
`);

/** Catat bahwa satu setup command barusan dijalankan (upsert timestamp). */
export function recordSetupRun(guildId, setupKey) {
    recordStmt.run({ guildId, setupKey, lastRunAt: Date.now() });
}

const getStmt = db.prepare(
    "SELECT last_run_at FROM setup_log WHERE guild_id = ? AND setup_key = ?"
);

/** Kapan terakhir dijalankan (ms), null kalau belum pernah. */
export function getSetupRunAt(guildId, setupKey) {
    return getStmt.get(guildId, setupKey)?.last_run_at ?? null;
}
