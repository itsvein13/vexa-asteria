import { EmbedBuilder } from "discord.js";
import { getMilestones, getClaimedThresholds, claimMilestone } from "../database/referralRewards.js";
import { getInviteStats } from "../database/inviteTracking.js";
import { addShards } from "../database/economy.js";
import { EMBED_FOOTER } from "../config/constants.js";
import COLORS from "../config/colors.js";

/**
 * Cek apakah inviterId ini baru saja mencapai milestone referral baru
 * (berdasarkan invite AKTIF-nya sekarang), klaim + kasih Shards buat
 * tiap milestone yang baru tercapai. Idempotent — aman dipanggil
 * berkali-kali (mis. dari guildMemberAdd dan /referral-sync), setiap
 * milestone cuma pernah ke-reward sekali per member selamanya.
 *
 * Balikin array milestone yang BARU diberikan (buat notifikasi),
 * kosong kalau tidak ada perubahan.
 */
export function checkReferralMilestones(guildId, userId) {

    const milestones = getMilestones(guildId);
    if (!milestones.length) return [];

    const { active } = getInviteStats(guildId, userId);
    if (active === 0) return [];

    const claimed = getClaimedThresholds(guildId, userId);
    const newlyEarned = [];

    for (const milestone of milestones) {

        if (active < milestone.threshold) continue;
        if (claimed.has(milestone.threshold)) continue;

        // Guard atomik — kalau ada proses lain (sync manual + event join
        // bersamaan) yang barusan klaim ini duluan, skip tanpa reward dobel.
        const claimedNow = claimMilestone(guildId, userId, milestone.threshold);
        if (!claimedNow) continue;

        addShards(userId, guildId, milestone.reward);
        newlyEarned.push(milestone);

    }

    return newlyEarned;

}

/**
 * DM best-effort ke inviter yang baru dapat satu/lebih milestone.
 * Kegagalan (DM tertutup, sudah tidak share guild, dsb) diabaikan —
 * reward-nya sendiri tetap tersimpan di database terlepas dari ini.
 */
export async function notifyReferralRewards(client, guild, userId, milestones) {

    if (!milestones.length) return;

    const user = await client.users.fetch(userId).catch(() => null);
    if (!user) return;

    const totalReward = milestones.reduce((sum, m) => sum + m.reward, 0);

    const lines = milestones.map(m =>
        `${m.label} — invite ke-**${m.threshold}** tercapai, dapet **${m.reward.toLocaleString()}** 💎`
    );

    const embed = new EmbedBuilder()
        .setColor(COLORS.gold)
        .setTitle("🎉 Referral Milestone Tercapai!")
        .setDescription([
            `Makasih udah ngajak orang gabung ke **${guild.name}**!`,
            "",
            ...lines,
            "",
            `Total: **${totalReward.toLocaleString()}** 💎 masuk saldo kamu.`
        ].join("\n"))
        .setFooter(EMBED_FOOTER);

    await user.send({ embeds: [embed] }).catch(() => {});

}
