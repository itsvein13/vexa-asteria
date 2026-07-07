import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export default async function loadCommands(client) {

    const commandFolders = fs.readdirSync("./src/commands");

    for (const folder of commandFolders) {

        const commandFiles = fs
            .readdirSync(`./src/commands/${folder}`)
            .filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {

            const filePath = path.join(
                process.cwd(),
                "src",
                "commands",
                folder,
                file
            );

            const command = (await import(pathToFileURL(filePath))).default;

            client.commands.set(command.data.name, command);

            console.log(`✅ Loaded command: ${command.data.name}`);

        }

    }

}