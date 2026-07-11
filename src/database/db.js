import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Database sekarang di data/ (luar src/) supaya ga ikut ter-zip /
// ter-commit bareng kode. Migrasi dari lokasi lama berjalan otomatis.
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "vexa.sqlite");

const OLD_DIR = path.join(process.cwd(), "src", "database");

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Auto-migrasi sekali jalan: kalau db baru belum ada tapi db lama ada,
// pindahkan (termasuk file WAL/SHM biar ga ada transaksi yang hilang).
if (!fs.existsSync(DB_PATH) && fs.existsSync(path.join(OLD_DIR, "vexa.sqlite"))) {

    for (const suffix of ["", "-wal", "-shm"]) {

        const oldFile = path.join(OLD_DIR, `vexa.sqlite${suffix}`);
        const newFile = path.join(DB_DIR, `vexa.sqlite${suffix}`);

        if (fs.existsSync(oldFile)) {
            fs.copyFileSync(oldFile, newFile);
        }

    }

    console.log("📦 Database dimigrasi dari src/database/ ke data/");

}

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS levels (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        xp INTEGER NOT NULL DEFAULT 0,
        last_message_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS daily (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        last_claim_at INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS economy (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        acquired_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, guild_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS profile_settings (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        active_theme TEXT NOT NULL DEFAULT 'default',
        PRIMARY KEY (user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS ticket_config (
        guild_id TEXT PRIMARY KEY,
        staff_role_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        log_channel_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
        guild_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at INTEGER NOT NULL DEFAULT 0,
        closed_at INTEGER,
        closed_by TEXT,
        PRIMARY KEY (guild_id, number)
    );
`);

export default db;
