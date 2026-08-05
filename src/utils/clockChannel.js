import db from "../database/db.js";

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const INTERVAL_MS = 5 * 60 * 1000; // batas aman rate limit rename Discord (2x/10 menit)

const getStmt = db.prepare("SELECT guild_id, channel_id, label FROM clock_channel");

const setStmt = db.prepare(`
    INSERT INTO clock_channel (guild_id, channel_id, label)
    VALUES (@guildId, @channelId, @label)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = @channelId, label = @label
`);

export function setClockChannel(guildId, channelId, label) {
    setStmt.run({ guildId, channelId, label });
}

const getOneStmt = db.prepare(
    "SELECT guild_id, channel_id, label FROM clock_channel WHERE guild_id = ?"
);

/** Ambil config clock channel satu guild (buat /setup-status), null kalau belum diatur. */
export function getClockChannel(guildId) {
    return getOneStmt.get(guildId) ?? null;
}

/** "21:45 WIB" dari timestamp sekarang. */
export function wibTimeLabel(now = Date.now()) {

    const wib = new Date(now + WIB_OFFSET_MS);
    const hh = String(wib.getUTCHours()).padStart(2, "0");
    const mm = String(wib.getUTCMinutes()).padStart(2, "0");

    return `${hh}:${mm} WIB`;

}

export function clockChannelName(label, now = Date.now()) {
    return `📻 ${label} • ${wibTimeLabel(now)}`.slice(0, 100);
}

/** Update nama semua clock channel yang terdaftar (best-effort). */
async function tick(client) {

    for (const row of getStmt.all()) {

        const channel = client.channels.cache.get(row.channel_id);

        // Channel dihapus manual → biarkan, admin bisa setup ulang.
        if (!channel) continue;

        const name = clockChannelName(row.label);

        if (channel.name !== name) {
            await channel.setName(name).catch(error =>
                console.warn(`⚠️ clockChannel gagal rename: ${error.message}`)
            );
        }

    }

}

/**
 * Mulai updater jam — dipanggil sekali dari clientReady.
 * Disejajarkan ke kelipatan 5 menit biar jamnya terlihat "bulat".
 */
export function startClockUpdater(client) {

    const now = Date.now();
    const delay = INTERVAL_MS - (now % INTERVAL_MS);

    setTimeout(() => {

        tick(client);
        setInterval(() => tick(client), INTERVAL_MS);

    }, delay);

    // Update pertama langsung, tanpa nunggu kelipatan 5 menit
    tick(client);

}
