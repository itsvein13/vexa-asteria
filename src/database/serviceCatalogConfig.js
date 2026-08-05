import db from "./db.js";

// Nyimpen channel tempat panel katalog jasa di-post + message_id-nya,
// biar tiap kali harga berubah (`/service-price-set` / `-remove`) panel
// yang udah ke-post bisa di-edit di tempat, bukan spam pesan baru.
// Pola sama kayak attachSuggestionMessage di suggestions.js.

const getStmt = db.prepare(
    "SELECT channel_id, message_id FROM service_catalog_config WHERE guild_id = ?"
);

export function getServiceCatalogConfig(guildId) {

    const row = getStmt.get(guildId);
    if (!row) return null;

    return { channelId: row.channel_id, messageId: row.message_id };

}

const setChannelStmt = db.prepare(`
    INSERT INTO service_catalog_config (guild_id, channel_id, message_id)
    VALUES (@guildId, @channelId, NULL)
    ON CONFLICT(guild_id)
    DO UPDATE SET channel_id = @channelId, message_id = NULL
`);

/** Ganti channel tujuan — reset message_id (channel baru = perlu post baru). */
export function setServiceCatalogChannel(guildId, channelId) {
    setChannelStmt.run({ guildId, channelId });
}

const setMessageStmt = db.prepare(`
    UPDATE service_catalog_config SET message_id = @messageId WHERE guild_id = @guildId
`);

/** Simpan referensi pesan panel setelah berhasil terkirim. */
export function setServiceCatalogMessage(guildId, messageId) {
    setMessageStmt.run({ guildId, messageId });
}
