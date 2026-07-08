import ROLES from "../config/roles.js";

export function getMainRole(member) {
    if (member.roles.cache.has(ROLES.WANDERER))
        return "🏹 Wanderer";

    return "🚀 Initiate";
}

export function getGames(member) {

    const games = [];

    if (member.roles.cache.has(ROLES.NFS))
        games.push("🏎 Need For Speed");

    if (member.roles.cache.has(ROLES.RACING_MASTER))
        games.push("🏁 Racing Master");

    if (member.roles.cache.has(ROLES.GTA))
        games.push("🚗 GTA V");

    if (member.roles.cache.has(ROLES.DELTA))
        games.push("🪖 Delta Force");

    if (member.roles.cache.has(ROLES.VALORANT))
        games.push("💥 Valorant");

    if (member.roles.cache.has(ROLES.PUBG))
        games.push("🔫 PUBG");

    if (member.roles.cache.has(ROLES.ML))
        games.push("⚔️ Mobile Legends");

    if (member.roles.cache.has(ROLES.ROBLOX))
        games.push("🟩 Roblox");

    if (member.roles.cache.has(ROLES.CS2))
        games.push("💣 Counter-Strike 2");

    if (member.roles.cache.has(ROLES.MINECRAFT))
        games.push("⛏ Minecraft");

    return games.length
        ? games.map(game => `> ${game}`).join("\n")
        : "> No games selected.";
}

export function getVibe(member) {

    if (member.roles.cache.has(ROLES.CHILL))
        return "> 🌿 Chill";

    if (member.roles.cache.has(ROLES.YAPPER))
        return "> 💬 Yapper";

    if (member.roles.cache.has(ROLES.COMPETITIVE))
        return "> 🔥 Competitive";

    if (member.roles.cache.has(ROLES.NOCTURNAL))
        return "> 🌙 Nocturnal";

    if (member.roles.cache.has(ROLES.MUSIC_LOVER))
        return "> 🎵 Music Lover";

    if (member.roles.cache.has(ROLES.MOVIE_ENJOYER))
        return "> 🎬 Movie Enjoyer";

    if (member.roles.cache.has(ROLES.TECH_ENTHUSIAST))
        return "> 💻 Tech Enthusiast";

    return "> No vibe selected.";
}

export function getCreator(member) {

    if (member.roles.cache.has(ROLES.STREAMER))
        return "> 🔴 Streamer";

    return "> 👤 Community Member";
}

export function formatDate(timestamp) {

    return new Date(timestamp).toLocaleDateString("en-US", {

        day: "numeric",
        month: "long",
        year: "numeric"

    });

}