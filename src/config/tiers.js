import ROLES from "./roles.js";

/**
 * Rarity/tier system — card treatment (accent color, glow, label)
 * driven by the member's actual role, like a trading-card rarity.
 * Priority: Overlord > Streamer > Wanderer > Initiate.
 */
const TIERS = {

    legendary: {
        label: "LEGENDARY",
        color: "#FFD54F",
        glow: "#FFC107",
        soft: "rgba(255,213,79,0.14)",
        border: "rgba(255,213,79,0.4)"
    },

    epic: {
        label: "EPIC",
        color: "#FB4570",
        glow: "#FF2E63",
        soft: "rgba(251,69,112,0.14)",
        border: "rgba(251,69,112,0.4)"
    },

    rare: {
        label: "WANDERER",
        color: "#A855F7",
        glow: "#C084FC",
        soft: "rgba(168,85,247,0.14)",
        border: "rgba(168,85,247,0.4)"
    },

    common: {
        label: "INITIATE",
        color: "#8B95AB",
        glow: "#A5AFC4",
        soft: "rgba(139,149,171,0.14)",
        border: "rgba(139,149,171,0.35)"
    }

};

export function getTier(member) {

    const roles = member.roles.cache;

    if (roles.has(ROLES.OVERLORD)) return TIERS.legendary;
    if (roles.has(ROLES.STREAMER)) return TIERS.epic;
    if (roles.has(ROLES.WANDERER)) return TIERS.rare;

    return TIERS.common;

}

export default TIERS;