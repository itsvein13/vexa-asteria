import { ActivityType } from "discord.js";

const GUILD_ID = "1264187541205155901";

export default {

    name: "ready",
    once: true,

    async execute(client) {

        console.log(`✅ ${client.user.tag} is online!`);

        const guild = client.guilds.cache.get(GUILD_ID);

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

    }

};