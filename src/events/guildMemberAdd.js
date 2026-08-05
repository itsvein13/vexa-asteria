import { resolveUsedInvite } from "../utils/inviteCache.js";
import { recordJoin } from "../database/inviteTracking.js";

export default {

    name: "guildMemberAdd",

    async execute(member) {

        // Bot lain yang ditambahkan (OAuth, bukan invite link) — skip.
        if (member.user.bot) return;

        const used = await resolveUsedInvite(member.guild);

        recordJoin(
            member.guild.id,
            member.id,
            used?.inviterId ?? null,
            used?.code ?? null
        );

    }

};
