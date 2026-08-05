/**
 * Preset tangga level role "Rookie -> Legend" — dipakai oleh
 * /level-roles-setup untuk membuat + mendaftarkan role sekali klik.
 * Warna bergradasi ungu (accent Vexa) -> emas (premium), 6 tingkat.
 *
 * Ini HANYA preset default. Tangga level sesungguhnya disimpan di
 * database (tabel level_roles), jadi admin bisa menambah/menghapus
 * tingkatan lain kapan saja lewat /level-role-add dan
 * /level-role-remove tanpa perlu redeploy kode.
 */
const LEVEL_LADDER_PRESET = [
    { level: 5,  label: "Rookie",  emoji: "🔰", color: "#A855F7" },
    { level: 10, label: "Adept",   emoji: "⚔️", color: "#B96FD5" },
    { level: 15, label: "Veteran", emoji: "🛡️", color: "#CB88B4" },
    { level: 20, label: "Elite",   emoji: "🔷", color: "#DCA292" },
    { level: 25, label: "Master",  emoji: "🌟", color: "#EEBB71" },
    { level: 30, label: "Legend",  emoji: "🏆", color: "#FFD54F" }
];

export default LEVEL_LADDER_PRESET;
