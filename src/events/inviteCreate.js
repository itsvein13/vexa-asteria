import { cacheInviteCreate } from "../utils/inviteCache.js";

export default {

    name: "inviteCreate",

    async execute(invite) {
        cacheInviteCreate(invite);
    }

};
