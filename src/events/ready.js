import { ActivityType } from "discord.js";
import { startClockUpdater } from "../utils/clockChannel.js";

const GUILD_ID = process.env.GUILD_ID;

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

        async function updatePresence() {

            const total = guild?.memberCount ?? 0;

            const activities = [

                {
                    name: `${total} Members`,
                    type: ActivityType.Watching
                },

                {
                    name: "Need roles? Visit #role-menu",
                    type: ActivityType.Playing
                },

                {
                    name: "Synd1cate Community",
                    type: ActivityType.Watching
                },

                {
                    name: "Official Synd1cate Bot",
                    type: ActivityType.Watching
                },
                {
                    name: "BANG ASLE? PANTEEEEKK",
                    type: ActivityType.Watching
                }

            ];

            client.user.setActivity(
                activities[index].name,
                {
                    type: activities[index].type
                }
            );

            index++;

            if (index >= activities.length)
                index = 0;

        }

        await updatePresence();

        setInterval(updatePresence, 30000);

        // Voice clock channel (Lofi Radio) — update jam WIB tiap 5 menit
        startClockUpdater(client);

    }

};