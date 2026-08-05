// Cache in-memory snapshot invite tiap guild, dipakai buat diff waktu
// ada member baru join supaya tau invite mana yang barusan kepake.
// key: guildId -> Map<code, { uses, maxUses, inviterId }>
const cache = new Map();

const VANITY_KEY = "__vanity__";

function snapshot(invites) {

    const map = new Map();

    for (const invite of invites.values()) {
        map.set(invite.code, {
            uses: invite.uses ?? 0,
            maxUses: invite.maxUses ?? 0,
            inviterId: invite.inviter?.id ?? null
        });
    }

    return map;

}

async function fetchVanityUses(guild) {

    if (!guild.vanityURLCode) return null;

    try {
        const vanity = await guild.fetchVanityData();
        return vanity.uses ?? 0;
    } catch {
        // Guild ga punya fitur Vanity URL (perlu partnered/boost level 3) — abaikan.
        return null;
    }

}

/**
 * Populate cache awal untuk satu guild — dipanggil sekali waktu bot
 * ready. Butuh izin bot **Manage Server** buat guild.invites.fetch();
 * kalau ga ada, invite tracking tetap ga bikin bot crash, cuma
 * inviter-nya nanti ga bisa diidentifikasi (inviterId = null).
 */
export async function cacheGuildInvites(guild) {

    try {

        const invites = await guild.invites.fetch();
        const map = snapshot(invites);

        const vanityUses = await fetchVanityUses(guild);
        if (vanityUses !== null) {
            map.set(VANITY_KEY, { uses: vanityUses, maxUses: 0, inviterId: null });
        }

        cache.set(guild.id, map);

    } catch (error) {
        console.warn(`⚠️ Invite tracking: gagal fetch invites di ${guild.name} (${error.message}). Pastikan bot punya izin Manage Server.`);
        cache.set(guild.id, new Map());
    }

}

/** Update cache waktu ada invite baru dibuat (event inviteCreate). */
export function cacheInviteCreate(invite) {

    const guildMap = cache.get(invite.guild.id) ?? new Map();

    guildMap.set(invite.code, {
        uses: invite.uses ?? 0,
        maxUses: invite.maxUses ?? 0,
        inviterId: invite.inviter?.id ?? null
    });

    cache.set(invite.guild.id, guildMap);

}

/** Hapus entry cache waktu invite dihapus manual (event inviteDelete). */
export function cacheInviteDelete(invite) {
    cache.get(invite.guild.id)?.delete(invite.code);
}

/**
 * Cari invite mana yang baru dipakai dengan diff snapshot lama (cache)
 * vs fresh fetch, lalu update cache ke snapshot baru. Balikin
 * { code, inviterId } kalau ketemu, atau null kalau ga bisa
 * diidentifikasi (race condition langka / integrasi invite eksternal).
 */
export async function resolveUsedInvite(guild) {

    const before = cache.get(guild.id) ?? new Map();

    let invites;
    try {
        invites = await guild.invites.fetch();
    } catch (error) {
        console.warn(`⚠️ Invite tracking: gagal fetch invites di ${guild.name} saat member join (${error.message}).`);
        return null;
    }

    const after = snapshot(invites);

    const vanityUses = await fetchVanityUses(guild);
    if (vanityUses !== null) {
        after.set(VANITY_KEY, { uses: vanityUses, maxUses: 0, inviterId: null });
    }

    // Kasus normal: invite yang masih ada, uses-nya nambah dibanding cache lama.
    for (const [code, data] of after) {

        const prev = before.get(code);

        if ((prev && data.uses > prev.uses) || (!prev && data.uses > 0 && code !== VANITY_KEY)) {
            cache.set(guild.id, after);
            return code === VANITY_KEY
                ? { code: guild.vanityURLCode, inviterId: null }
                : { code, inviterId: data.inviterId };
        }

    }

    // Kasus single-use invite: Discord langsung hapus invite-nya begitu
    // dipakai, sebelum kita sempat fetch ulang — jadi dia hilang total
    // dari snapshot baru. Kandidatnya: ada di cache lama, uses tinggal
    // 1 langkah lagi ke maxUses, dan sekarang sudah tidak ada.
    for (const [code, data] of before) {

        if (code === VANITY_KEY) continue;

        if (!after.has(code) && data.maxUses > 0 && data.uses === data.maxUses - 1) {
            cache.set(guild.id, after);
            return { code, inviterId: data.inviterId };
        }

    }

    cache.set(guild.id, after);
    return null;

}
