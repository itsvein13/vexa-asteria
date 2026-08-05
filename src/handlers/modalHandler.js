import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export default async function loadModals(client) {

    const dir = "./src/interactions/modals";

    // Folder opsional — belum tentu ada modal, jangan error kalau kosong.
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(file => file.endsWith(".js"));

    for (const file of files) {

        const filePath = path.join(
            process.cwd(),
            "src",
            "interactions",
            "modals",
            file
        );

        const modal = (await import(pathToFileURL(filePath))).default;

        if (!modal?.customId) {
            console.error(`❌ ${file} tidak punya customId.`);
            continue;
        }

        client.modals.set(modal.customId, modal);

        console.log(`✅ Loaded modal: ${modal.customId}`);

    }

}
