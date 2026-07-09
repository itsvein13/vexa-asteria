import ROLES from "../../config/roles.js";

export function getProfileData(member) {

    const roles = member.roles.cache;

    // Main Role
    let mainRole = "Initiate";

    if (roles.has(ROLES.WANDERER))
        mainRole = "Wanderer";

    // Creator
    let creator = "Community Member";

    if (roles.has(ROLES.STREAMER))
        creator = "Streamer";

    // Vibe
    let vibe = "No vibe";

    if (roles.has(ROLES.CHILL))
        vibe = "Chill";

    else if (roles.has(ROLES.YAPPER))
        vibe = "Yapper";

    else if (roles.has(ROLES.COMPETITIVE))
        vibe = "Competitive";

    else if (roles.has(ROLES.NOCTURNAL))
        vibe = "Nocturnal";

    else if (roles.has(ROLES.MUSIC_LOVER))
        vibe = "Music Lover";

    else if (roles.has(ROLES.MOVIE_ENJOYER))
        vibe = "Movie Enjoyer";

    else if (roles.has(ROLES.TECH_ENTHUSIAST))
        vibe = "Tech Enthusiast";

    // Games
    const games = [];

    if (roles.has(ROLES.NFS))
        games.push("Need For Speed");

    if (roles.has(ROLES.RACING_MASTER))
        games.push("Racing Master");

    if (roles.has(ROLES.GTA))
        games.push("GTA V");

    if (roles.has(ROLES.DELTA))
        games.push("Delta Force");

    if (roles.has(ROLES.VALORANT))
        games.push("Valorant");

    if (roles.has(ROLES.PUBG))
        games.push("PUBG");

    if (roles.has(ROLES.ML))
        games.push("Mobile Legends");

    if (roles.has(ROLES.ROBLOX))
        games.push("Roblox");

    if (roles.has(ROLES.CS2))
        games.push("Counter-Strike 2");

    if (roles.has(ROLES.MINECRAFT))
        games.push("Minecraft");

    // Badges (satu set, tanpa duplikat)
    const badges = [];

    if (roles.has(ROLES.OVERLORD))
        badges.push({ emoji: "👑", label: "Overlord", icon: "overlord" });

    if (roles.has(ROLES.WANDERER))
        badges.push({ emoji: "🧭", label: "Wanderer", icon: "wanderer" });

    if (roles.has(ROLES.STREAMER))
        badges.push({ emoji: "📹", label: "Streamer", icon: "streamer" });

    if (roles.has(ROLES.HUMAN_BEING))
        badges.push({ emoji: "👤", label: "Human", icon: "human" });

    return {

        displayName: member.displayName,

        username: member.user.username,

        avatar: member.user.displayAvatarURL({
            extension: "png",
            size: 512
        }),

        mainRole,

        creator,

        vibe,

        games,

        badges,

        joinedAt: member.joinedAt,

        discordSince: member.user.createdAt

    };

}