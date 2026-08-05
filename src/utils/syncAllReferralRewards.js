import { getAllInviterCounts } from "../database/inviteTracking.js";
import { checkReferralMilestones, notifyReferralRewards } from "./referralRewards.js";

/**
 * Re-cek milestone referral SEMUA inviter di guild ini — dipakai
 * /referral-rewards-setup (otomatis setelah bikin preset) dan
 * /referral-sync (manual, mis. setelah nambah milestone baru lewat
 * /referral-milestone-add). Beda dari cek per-join di guildMemberAdd:
 * ini nyisir semua orang sekaligus, bukan cuma satu inviter yang baru
 * dapat member.
 *
 * Balikin ringkasan: { checked, granted, totalReward }.
 */
export async function syncAllReferralRewards(guild) {

    const inviters = getAllInviterCounts(guild.id);

    let granted = 0;
    let totalReward = 0;

    for (const { inviterId } of inviters) {

        const earned = checkReferralMilestones(guild.id, inviterId);

        if (earned.length) {

            granted += earned.length;
            totalReward += earned.reduce((sum, m) => sum + m.reward, 0);

            await notifyReferralRewards(guild.client, guild, inviterId, earned);

        }

    }

    return { checked: inviters.length, granted, totalReward };

}
