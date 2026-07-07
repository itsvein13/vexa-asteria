import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export default async function loadButtons(client) {

    const buttonFiles = fs
        .readdirSync("./src/interactions/buttons")
        .filter(file => file.endsWith(".js"));

    for (const file of buttonFiles) {

        const filePath = path.join(
            process.cwd(),
            "src",
            "interactions",
            "buttons",
            file
        );

        const button = (await import(pathToFileURL(filePath))).default;

        client.buttons.set(button.customId, button);

        console.log(`✅ Loaded button: ${button.customId}`);
    }
}