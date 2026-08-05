import dotenv from "dotenv";
import client from "./client.js";
import loadCommands from "./handlers/commandHandler.js";
import loadButtons from "./handlers/buttonHandler.js";
import loadSelectMenus from "./handlers/selectMenuHandler.js";
import loadModals from "./handlers/modalHandler.js";

import loadEvents from "./handlers/eventHandler.js";

dotenv.config();

await loadEvents(client);
await loadCommands(client);
await loadButtons(client);
await loadSelectMenus(client);
await loadModals(client);

client.login(process.env.TOKEN);