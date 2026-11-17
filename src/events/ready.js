import { ActivityType } from "discord.js";
import { startClockUpdater } from "../utils/clockChannel.js";
import { cacheGuildInvites } from "../utils/inviteCache.js";
import { startAiChannelCleaner } from "../utils/aiChannel.js";
import { AI_CONFIG } from "../config/ai.config.js";
import { buildAiPanel, AI_PANEL_TITLE } from "../commands/admin/ai-setup.js";
import safeSend from "../utils/safeSend.js";

const GUILD_ID = process.env.GUILD_ID;

/**
 * Cek apakah panel AI masih ada di channel. Panel dicocokkan dari
 * judulnya yang PERSIS — panel lama yang judulnya beda nggak blokir
 * panel baru.
 */
async function aiPanelExists(channel, botId) {

    try {

        const existing = await channel.messages.fetch({ limit: 20 });

        return existing.some(msg =>
            msg.author?.id === botId &&
            msg.embeds?.some(e => String(e.title ?? "").trim() === AI_PANEL_TITLE)
        );

    } catch {
        // Nggak bisa baca histori — anggap belum ada.
        return false;
    }

}

/**
 * Panel pembuka di #vexa-ai — dikirim sekali kalau belum ada.
 */
async function postAiStarter(client) {

    const channelId = AI_CONFIG.channel.vexaAiChannelId;

    const channel = client.channels.cache.get(channelId);

    if (!channel?.isTextBased?.()) return;

    if (await aiPanelExists(channel, client.user.id)) return;

    await safeSend(channel, { embeds: [buildAiPanel()] });

}

export default {

    name: "clientReady",
    once: true,

    async execute(client) {

        console.log(`✅ ${client.user.tag} is online!`);

        // Ambil guild dari env; kalau env kosong/salah, fallback ke
        // server pertama tempat bot berada (Vexa single-guild).
        // Log diagnostik biar salah konfigurasi langsung kelihatan.
        let guild = client.guilds.cache.get(GUILD_ID);

        if (!guild) {

            console.warn(
                `⚠️ GUILD_ID ${GUILD_ID ? `"${GUILD_ID}" tidak cocok` : "belum di-set"} — ` +
                `fallback ke guild pertama di cache.`
            );

            guild = client.guilds.cache.first();

        }

        console.log(
            guild
                ? `🏠 Guild aktif: ${guild.name} (${guild.memberCount} members)`
                : "❌ Bot tidak berada di guild mana pun!"
        );

        let index = 0;

        // Rotasi presence tiap 30 detik.
        // Catatan: Discord rate-limit presence ~1x per menit, jadi
        // update yang keburu bisa ditolak — efeknya kadang tiap ~60 detik.
        const PRESENCE_INTERVAL_MS = 30 * 1000;

        async function updatePresence() {

            const activities = [
                { name: "mencurahkan hati lewat status doang", type: ActivityType.Playing },
                { name: "hidup segan, offline pun sayang", type: ActivityType.Playing },
                { name: "sibuk (padahal enggak)", type: ActivityType.Watching },
                { name: "jatuh bangun, ya bangun lagi", type: ActivityType.Playing },
                { name: "pengennya istirahat, tapi ada aja", type: ActivityType.Playing },
                { name: "dengerin lagu yang sama, berulang", type: ActivityType.Playing },
                { name: "hidup itu antri, sabar itu kunci", type: ActivityType.Playing },
                { name: "bang asle kenapa suka marah ya?", type: ActivityType.Watching },
                { name: "Official Synd1cate Bot", type: ActivityType.Watching }
            ];

            const current = activities[index];

            client.user.setActivity(current.name, { type: current.type });

            index = (index + 1) % activities.length;

            setTimeout(updatePresence, PRESENCE_INTERVAL_MS);

        }

        await updatePresence();

        // Voice clock channel (Lofi Radio) — update jam WIB tiap 5 menit
        startClockUpdater(client);

        // Panel pembuka di #vexa-ai (sekali, kalau belum ada).
        await postAiStarter(client);

        // Bersihkan pesan user di #vexa-ai yang > 20 menit.
        startAiChannelCleaner(client);

        // Invite tracker: populate cache snapshot tiap guild biar
        // guildMemberAdd bisa diff & tau siapa yang invite siapa.
        for (const g of client.guilds.cache.values()) {
            await cacheGuildInvites(g);
        }

    }

};