import ROLES from "./roles.js";

/**
 * Mapping level → role reward.
 * Urutkan ascending berdasarkan level. Mode: REPLACE —
 * member cuma pegang satu role reward (yang tertinggi).
 *
 * Tambah reward baru cukup tambah entry di sini,
 * tidak perlu sentuh kode lain.
 */
const LEVEL_ROLES = [

    {
        level: 10,
        roleId: ROLES.WANDERER,
        label: "Wanderer"
    }

];

export default LEVEL_ROLES;
