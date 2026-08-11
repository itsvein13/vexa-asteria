import roles from "../config/roles.js";

/**
 * 3 Role Utama yang SALING EKSKLUSIF — satu member cuma boleh pegang SATU.
 * streamer / ladies / wanderer tidak bisa dimiliki bersamaan.
 *
 * Event ini menjaga aturan itu dari SATU tempat pusat, sehingga berlaku
 * untuk SEMUA jalur pemberian role:
 *   - verify (tombol verifikasi -> Wanderer)
 *   - level-up otomatis ke level 10 (-> Wanderer)
 *   - staff approve aplikasi creator (-> Streamer)
 *   - staff kasih role manual lewat Discord (Streamer / Ladies)
 *
 * Sekali jalan, ia juga otomatis "memperbaiki" member yang kebetulan
 * sudah pegang lebih dari satu (data lama yang dobel).
 *
 * Urutan array = PRIORITAS. Kalau sebuah member pegang lebih dari satu
 * role utama, yang posisinya paling ATAS dipertahankan, sisanya dicabut.
 *   STREAMER  > LADIES > WANDERER
 * (Wanderer adalah member default, prioritas terendah.)
 * Mau ubah urutan? Cukup susun ulang array di bawah.
 */
const MAIN_ROLES = [
    roles.STREAMER,   // prioritas tertinggi
    roles.LADIES,
    roles.WANDERER    // prioritas terendah (default member)
];

export default {

    name: "guildMemberUpdate",

    async execute(oldMember, newMember) {

        // Jangan proses bot lain.
        if (newMember.user.bot) return;

        // Role utama yang sedang dipegang member SEKARANG.
        const heldMain = MAIN_ROLES.filter(id => newMember.roles.cache.has(id));

        // Tidak pegang lebih dari satu role utama — tidak ada yang perlu dibersihkan.
        if (heldMain.length <= 1) return;

        // Pertahankan yang prioritas tertinggi, cabut sisanya.
        const keepId = MAIN_ROLES.find(id => heldMain.includes(id));
        const toRemove = heldMain.filter(id => id !== keepId);

        if (toRemove.length === 0) return;

        try {
            await newMember.roles.remove(toRemove);
        } catch (error) {
            // Biasanya karena bot tidak punya izin Manage Roles atau rolenya
            // berada di atas posisi bot di hierarchy. Cukup log, jangan crash.
            console.error(`guildMemberUpdate gagal cabut role utama: ${error.message}`);
        }
    }
};
