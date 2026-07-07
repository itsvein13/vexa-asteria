import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export default async function loadEvents(client) {
    const eventFiles = fs
        .readdirSync("./src/events")
        .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        const filePath = path.join(process.cwd(), "src", "events", file);

        const event = (await import(pathToFileURL(filePath))).default;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }

        console.log(`✅ Loaded event: ${event.name}`);
    }
}