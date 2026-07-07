import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

dotenv.config();

const commands = [];

const folders = fs.readdirSync("./src/commands");

for (const folder of folders) {

    const files = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {

        const filePath = path.join(
            process.cwd(),
            "src",
            "commands",
            folder,
            file
        );

        const command = (await import(pathToFileURL(filePath))).default;

        commands.push(command.data.toJSON());

    }

}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

try {

    console.log(`🚀 Deploying ${commands.length} commands...`);

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        ),
        { body: commands }
    );

    console.log("✅ Slash commands deployed!");

} catch (error) {

    console.error(error);

}