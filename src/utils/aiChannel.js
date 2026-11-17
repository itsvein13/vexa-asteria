import { AI_CONFIG } from "../config/ai.config.js";
import { AI_PANEL_TITLE } from "../commands/admin/ai-setup.js";

/**
 * Bersihkan #vexa-ai: pesan user yang umurnya > 20 menit dihapus.
 * Panel pembuka Vexa (embed title persis AI_PANEL_TITLE) disimpan.
 */

const CLEAN_INTERVAL_MS = 60 * 1000;      // cek tiap menit
const MAX_DELETE_AGE_MS = 20 * 60 * 1000;  // hapus yang > 20 menit
const MAX_DELETE_BATCH = 100;

let started = false;

function isStarterPanel(message) {

    if (message.author?.bot !== true) return false;

    return message.embeds?.some(embed =>
        String(embed.title ?? "").trim() === AI_PANEL_TITLE
    ) ?? false;

}

async function cleanChannel(client) {

    const channel = client.channels.cache.get(AI_CONFIG.channel.vexaAiChannelId);

    if (!channel?.isTextBased?.()) return;

    const cutoff = Date.now() - MAX_DELETE_AGE_MS;

    let fetched;

    try {
        fetched = await channel.messages.fetch({ limit: MAX_DELETE_BATCH });
    } catch (error) {
        console.warn(`⚠️ vexa-ai gagal fetch: ${error.message}`);
        return;
    }

    const expired = fetched.filter(message =>
        message.createdTimestamp < cutoff && !isStarterPanel(message)
    );

    if (expired.size === 0) return;

    try {
        // bulkDelete cuma bisa pesan < 14 hari — aman untuk jendela 20 menit.
        await channel.bulkDelete(expired, true);
    } catch (error) {
        console.warn(`⚠️ vexa-ai bulkDelete gagal: ${error.message}`);
    }

}

/** Mulai pembersih — dipanggil sekali dari clientReady. */
export function startAiChannelCleaner(client) {

    if (started) return;
    started = true;

    // Jalan sekali pas online, biar channel langsung bersih.
    cleanChannel(client);

    setInterval(() => cleanChannel(client), CLEAN_INTERVAL_MS);

}
