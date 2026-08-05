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

    CREATE TABLE IF NOT EXISTS level_roles (
        guild_id TEXT NOT NULL,
        level INTEGER NOT NULL,
        role_id TEXT NOT NULL,
        label TEXT NOT NULL,
        PRIMARY KEY (guild_id, level)
    );

    CREATE TABLE IF NOT EXISTS clock_channel (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT 'Lofi Radio'
    );

    CREATE TABLE IF NOT EXISTS creator_review_config (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS creator_applications (
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        link TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        submitted_at INTEGER NOT NULL DEFAULT 0,
        reviewed_by TEXT,
        reviewed_at INTEGER,
        PRIMARY KEY (guild_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS automod_config (
        guild_id TEXT PRIMARY KEY,
        log_channel_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
        guild_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        category TEXT,
        order_status TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at INTEGER NOT NULL DEFAULT 0,
        closed_at INTEGER,
        closed_by TEXT,
        PRIMARY KEY (guild_id, number)
    );

    CREATE TABLE IF NOT EXISTS mod_log_config (
        guild_id TEXT PRIMARY KEY,
        log_channel_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mod_cases (
        guild_id TEXT NOT NULL,
        case_number INTEGER NOT NULL,
        type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT NOT NULL DEFAULT 'No reason provided',
        duration_ms INTEGER,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, case_number)
    );

    CREATE INDEX IF NOT EXISTS idx_mod_cases_user
        ON mod_cases (guild_id, user_id, type, status);

    CREATE TABLE IF NOT EXISTS suggestion_config (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suggestions (
        guild_id TEXT NOT NULL,
        number INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        message_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_by TEXT,
        reviewed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, number)
    );

    CREATE TABLE IF NOT EXISTS invite_uses (
        guild_id TEXT NOT NULL,
        invited_user_id TEXT NOT NULL,
        inviter_id TEXT,
        invite_code TEXT,
        joined_at INTEGER NOT NULL DEFAULT 0,
        left_at INTEGER,
        PRIMARY KEY (guild_id, invited_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_invite_uses_inviter
        ON invite_uses (guild_id, inviter_id, left_at);

    CREATE TABLE IF NOT EXISTS testimonial_config (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
        guild_id TEXT NOT NULL,
        ticket_number INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        category TEXT,
        rating INTEGER NOT NULL,
        content TEXT,
        created_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, ticket_number)
    );

    CREATE TABLE IF NOT EXISTS referral_milestones (
        guild_id TEXT NOT NULL,
        threshold INTEGER NOT NULL,
        reward INTEGER NOT NULL,
        label TEXT NOT NULL,
        PRIMARY KEY (guild_id, threshold)
    );

    CREATE TABLE IF NOT EXISTS referral_claims (
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        threshold INTEGER NOT NULL,
        claimed_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, user_id, threshold)
    );

    CREATE TABLE IF NOT EXISTS setup_log (
        guild_id TEXT NOT NULL,
        setup_key TEXT NOT NULL,
        last_run_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, setup_key)
    );

    CREATE TABLE IF NOT EXISTS service_pricing (
        guild_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        price TEXT NOT NULL,
        note TEXT,
        updated_at INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS service_catalog_config (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        message_id TEXT
    );
`);

// Migrasi kolom: instalasi lama sudah punya tabel `tickets` dari sebelum
// kategori tiket ada, jadi CREATE TABLE IF NOT EXISTS di atas ga
// nambahin kolomnya. Cek dulu, tambahin kalau belum ada — data tiket
// lama tetap aman, cuma category-nya kosong (null) buat tiket lama.
const ticketColumns = db.prepare("PRAGMA table_info(tickets)").all().map(c => c.name);

if (!ticketColumns.includes("category")) {
    db.exec("ALTER TABLE tickets ADD COLUMN category TEXT");
    console.log("📦 Migrasi: kolom 'category' ditambahkan ke tabel tickets");
}

if (!ticketColumns.includes("order_status")) {
    db.exec("ALTER TABLE tickets ADD COLUMN order_status TEXT");
    console.log("📦 Migrasi: kolom 'order_status' ditambahkan ke tabel tickets");
}

export default db;
