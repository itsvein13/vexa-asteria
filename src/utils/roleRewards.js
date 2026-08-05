import { PermissionFlagsBits } from "discord.js";
import { getLevelRoles } from "../database/levelRoles.js";

/**
 * Reward tertinggi yang sudah dicapai di `level` tertentu, untuk
 * guild ini. Balikin null kalau belum ada yang tercapai (atau
 * server belum punya tangga level).
 */
export function rewardForLevel(guildId, level) {

    const ladder = getLevelRoles(guildId);

    let current = null;

    for (const reward of ladder) {
        if (level >= reward.level) current = reward;
    }

    return current;

}

/**
 * Sinkronkan role reward member dengan levelnya (mode REPLACE):
 * role reward tertinggi yang dicapai diberikan, role reward lain
 * dari tangga level server ini dilepas.
 *
 * Idempotent — aman dipanggil berulang. Balikin reward yang BARU
 * diberikan (untuk announcement), atau null kalau tidak ada perubahan,
 * server belum punya tangga level, bot tidak punya izin, atau posisi
 * role di atas bot.
 */
export async function syncRoleRewards(member, level) {

    if (!member?.guild) return null;

    const guildId = member.guild.id;
    const ladder = getLevelRoles(guildId);

    if (ladder.length === 0) return null;

    const target = rewardForLevel(guildId, level);
    if (!target) return null;

    const me = member.guild.members.me;

    // Guard permission & hierarchy — jangan lempar error kalau
    // server belum dikonfigurasi dengan benar, cukup log sekali.
    if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
        console.warn("⚠️ roleRewards: bot tidak punya izin Manage Roles.");
        return null;
    }

    const role = member.guild.roles.cache.get(target.roleId);

    if (!role) {
        console.warn(`⚠️ roleRewards: role ${target.label} (${target.roleId}) tidak ditemukan.`);
        return null;
    }

    if (role.position >= me.roles.highest.position) {
        console.warn(`⚠️ roleRewards: role ${target.label} di atas role bot (hierarchy).`);
        return null;
    }

    try {

        // REPLACE: lepas role reward lain di tangga ini yang masih nempel
        const toRemove = ladder
            .filter(r => r.roleId !== target.roleId && member.roles.cache.has(r.roleId))
            .map(r => r.roleId);

        if (toRemove.length) {
            await member.roles.remove(toRemove, "Vexa: level role reward (replace)");
        }

        // Sudah punya reward yang benar → tidak ada yang baru
        if (member.roles.cache.has(target.roleId)) return null;

        await member.roles.add(target.roleId, `Vexa: reward Level ${target.level}`);

        return target;

    } catch (error) {
        console.error(`❌ roleRewards gagal untuk ${member.user?.tag}: ${error.message}`);
        return null;
    }

}
