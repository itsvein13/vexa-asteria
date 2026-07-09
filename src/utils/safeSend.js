import { PermissionFlagsBits } from "discord.js";

/**
 * Kirim pesan ke channel dengan aman:
 * - Cek dulu bot punya izin SendMessages (dan EmbedLinks kalau ada embed).
 * - Bungkus try/catch supaya satu channel bermasalah ga bikin unhandled rejection.
 *
 * Balikin Message kalau sukses, null kalau di-skip / gagal.
 */
export default async function safeSend(channel, payload) {

    if (!channel?.isTextBased?.()) return null;

    // Di guild, cek permission dulu. Di DM permissionsFor ga relevan.
    const me = channel.guild?.members?.me;

    if (me) {

        const perms = channel.permissionsFor(me);

        if (!perms?.has(PermissionFlagsBits.SendMessages)) return null;

        if (payload?.embeds?.length && !perms.has(PermissionFlagsBits.EmbedLinks)) {
            return null;
        }

    }

    try {
        return await channel.send(payload);
    } catch (error) {
        console.error(`⚠️ safeSend gagal di #${channel?.name ?? "unknown"}: ${error.message}`);
        return null;
    }

}
