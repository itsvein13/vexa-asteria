import roles from "../config/roles.js";

// Role utama yang saling eksklusif — satu member cuma boleh pegang satu.
// Urutan array = prioritas saat cabut otomatis: STREAMER > LADIES > WANDERER.
const MAIN_ROLES = [
    roles.STREAMER,
    roles.LADIES,
    roles.WANDERER
];

export default {

    name: "guildMemberUpdate",

    async execute(oldMember, newMember) {

        if (newMember.user.bot) return;

        const heldMain = MAIN_ROLES.filter(id => newMember.roles.cache.has(id));
        if (heldMain.length <= 1) return;

        // Pertahankan role prioritas tertinggi, lepas sisanya.
        const keepId = MAIN_ROLES.find(id => heldMain.includes(id));
        const toRemove = heldMain.filter(id => id !== keepId);
        if (toRemove.length === 0) return;

        try {
            await newMember.roles.remove(toRemove);
        } catch (error) {
            console.error(`guildMemberUpdate gagal cabut role utama: ${error.message}`);
        }
    }
};
