import { resolveUsedInvite } from "../utils/inviteCache.js";
import { recordJoin } from "../database/inviteTracking.js";
import { trackJoin, isNewAccount } from "../utils/antiRaid.js";
import { handleRaidTrigger, handleSuspiciousJoin } from "../utils/raidAction.js";

export default {

    name: "guildMemberAdd",

    async execute(member) {

        // Bot lain yang ditambahkan (OAuth, bukan invite link) — skip,
        // baik dari invite tracking maupun deteksi raid.
        if (member.user.bot) return;

        const used = await resolveUsedInvite(member.guild);

        recordJoin(
            member.guild.id,
            member.id,
            used?.inviterId ?? null,
            used?.code ?? null
        );

        // Anti-Raid: cek dulu apakah join ini bagian dari gelombang
        // mencurigakan sebelum lanjut ke hal lain.
        const raidStatus = trackJoin(member);

        if (raidStatus.justTriggered) {
            await handleRaidTrigger(member.guild, raidStatus.burst);
        } else if (raidStatus.inRaidMode && isNewAccount(member.user)) {
            await handleSuspiciousJoin(member);
        }

    }

};
