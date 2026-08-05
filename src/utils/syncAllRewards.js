import { getAllLevels } from "../database/levels.js";
import { rewardForLevel, syncRoleRewards } from "./roleRewards.js";

/**
 * Terapkan role reward ke semua member ber-XP di guild yang levelnya
 * sudah memenuhi tangga level saat ini. Dipakai oleh /sync-rewards
 * (manual) dan /level-roles-setup (otomatis setelah bikin tangga).
 *
 * Balikin ringkasan: { eligible, granted, alreadyOk, left }.
 */
export async function syncAllRewards(guild) {

    const rows = getAllLevels(guild.id);

    // Cuma proses member yang levelnya sudah mencapai reward pertama
    const eligible = rows.filter(row => rewardForLevel(guild.id, row.level) !== null);

    let granted = 0;
    let alreadyOk = 0;
    let left = 0;

    for (const row of eligible) {

        let member;

        try {
            member = await guild.members.fetch(row.userId);
        } catch {
            left++; // sudah keluar server / tidak ditemukan
            continue;
        }

        const reward = await syncRoleRewards(member, row.level);

        if (reward) granted++;
        else alreadyOk++;

    }

    return { eligible: eligible.length, granted, alreadyOk, left };

}
