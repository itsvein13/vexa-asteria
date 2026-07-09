/**
 * Theme profile card — palet yang MENIMPA palet tier di card.js.
 * Struktur field sama persis dengan TIERS (color/glow/soft/border)
 * supaya semua fungsi draw bisa memakainya tanpa perubahan.
 *
 * 'default' = tanpa override (kartu mengikuti warna tier member).
 */
const THEMES = {

    default: {
        id: "default",
        name: "Asteria Purple",
        emoji: "🟣",
        palette: null // ikut tier
    },

    crimson: {
        id: "crimson",
        name: "Crimson Nebula",
        emoji: "🔴",
        palette: {
            color: "#FB4570",
            glow: "#FF2E63",
            soft: "rgba(251,69,112,0.14)",
            border: "rgba(251,69,112,0.4)"
        }
    },

    emerald: {
        id: "emerald",
        name: "Emerald Void",
        emoji: "🟢",
        palette: {
            color: "#34D399",
            glow: "#10B981",
            soft: "rgba(52,211,153,0.14)",
            border: "rgba(52,211,153,0.4)"
        }
    },

    golden: {
        id: "golden",
        name: "Golden Dynasty",
        emoji: "🟡",
        palette: {
            color: "#FFD54F",
            glow: "#FFC107",
            soft: "rgba(255,213,79,0.14)",
            border: "rgba(255,213,79,0.4)"
        }
    }

};

export default THEMES;
