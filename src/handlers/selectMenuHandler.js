import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export default async function loadSelectMenus(client) {

    const files = fs
        .readdirSync("./src/interactions/selectMenus")
        .filter(file => file.endsWith(".js"));

    for (const file of files) {

        try {

            const filePath = path.join(
                process.cwd(),
                "src",
                "interactions",
                "selectMenus",
                file
            );

            const imported = await import(pathToFileURL(filePath));

            console.log(`📄 Loading: ${file}`);
            console.log(imported);

            const menu = imported.default;

            if (!menu) {
                console.error(`❌ ${file} doesn't have a default export.`);
                continue;
            }

            if (!menu.customId) {
                console.error(`❌ ${file} is missing customId.`);
                continue;
            }

            client.selectMenus.set(menu.customId, menu);

            console.log(`✅ Loaded select menu: ${menu.customId}`);

        } catch (err) {

            console.error(`❌ Failed to load ${file}`);
            console.error(err);

        }

    }

}