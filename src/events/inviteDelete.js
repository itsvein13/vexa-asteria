import { cacheInviteDelete } from "../utils/inviteCache.js";

export default {

    name: "inviteDelete",

    async execute(invite) {
        cacheInviteDelete(invite);
    }

};
