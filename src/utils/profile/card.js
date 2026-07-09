import { getProfileData } from "./data.js";
import { getTier } from "../../config/tiers.js";
import THEMES from "../../config/themes.js";
import { getActiveTheme } from "../../database/profileSettings.js";
import { getLevelData } from "../../database/levels.js";
import { drawAvatar } from "./drawAvatar.js";
import { drawIdentity } from "./drawIdentity.js";
import { drawBackground } from "./drawBackground.js";
import { drawXPBar } from "./drawXPBar.js";
import { drawBadges, getBadgesGridHeight } from "./drawBadges.js";
import { drawGames, getGamesGridHeight } from "./drawGames.js";
import { drawPanel } from "./drawPanel.js";
import { drawParticles } from "./drawParticles.js";
import LAYOUT from "../../config/layout.js";
import {
    createCanvas,
    loadImage
} from "canvas";
import { AttachmentBuilder } from "discord.js";
import path from "path";
import gifencPkg from "gifenc";
import "../registerFonts.js"; // registrasi font Poppins (shared)

const { GIFEncoder, quantize, applyPalette } = gifencPkg;

const WIDTH = 1672;
const HEIGHT = 941;
const GAP = 26;

const BACKGROUND_PATH = path.join(
    process.cwd(), "src", "assets", "profile", "profile-bg.png"
);

let cachedBackground = null;
async function getBackgroundImage() {
    if (!cachedBackground) {
        cachedBackground = await loadImage(BACKGROUND_PATH);
    }
    return cachedBackground;
}

/**
 * Draws one full frame of the profile card. `time` (0..1) drives the
 * ambient particle twinkle and the XP bar shimmer for animated export;
 * a static render just calls this once with time=0.
 */
function renderFrame(ctx, { member, profile, tier, levelData, avatarImage, backgroundImage, joinedDate, discordSince, time }) {

    // ==========================
    // Background + ambient particles
    // ==========================

    drawBackground(ctx, backgroundImage, WIDTH, HEIGHT);

    drawParticles(ctx, {
        width: WIDTH,
        height: HEIGHT,
        seed: member.id,
        tier,
        time
    });

    // ==========================
    // Avatar
    // ==========================

    drawAvatar(ctx, avatarImage, tier);

    // ==========================
    // Identity (name / username / tier tag)
    // ==========================

    let cursorY = drawIdentity(ctx, profile, tier);
    cursorY += GAP;

    // ==========================
    // XP Bar
    // "LEVEL" label sits 10px above the bar's own y, so bar y = cursorY + 10
    // makes the label line up right after the identity block.
    // ==========================

    const xpBarY = cursorY + 10;

    drawXPBar(ctx, {
        x: LAYOUT.panel.x,
        y: xpBarY,
        level: levelData.level,
        currentXP: levelData.currentXP,
        maxXP: levelData.xpNeeded,
        tier
    });

    // ==========================
    // Kategori: BADGES / ACTIVE GAMES / STATUS / ACCOUNT
    // Satu baris, full-width, sejajar.
    // ==========================

    const { grid } = LAYOUT;
    const rowY = grid.y;
    const usableWidth = WIDTH - grid.marginX * 2;
    const colWidth = (usableWidth - grid.gap * (grid.columns - 1)) / grid.columns;

    const colX = (index) => grid.marginX + index * (colWidth + grid.gap);

    // --- BADGES ---
    const badgesPanelX = colX(0);

    drawPanel(ctx, {
        title: "BADGES",
        items: profile.badges.length ? [] : ["No badges yet."],
        x: badgesPanelX,
        y: rowY,
        width: colWidth,
        height: grid.height,
        contentHeight: getBadgesGridHeight(profile.badges.length),
        tier
    });

    if (profile.badges.length) {
        drawBadges(ctx, {
            badges: profile.badges,
            x: badgesPanelX + 22,
            y: rowY + 66,
            tier
        });
    }

    // --- ACTIVE GAMES ---
    const gamesPanelX = colX(1);

    drawPanel(ctx, {
        title: "ACTIVE GAMES",
        items: profile.games.length ? [] : ["No games selected."],
        x: gamesPanelX,
        y: rowY,
        width: colWidth,
        height: grid.height,
        contentHeight: getGamesGridHeight(profile.games.length),
        tier
    });

    if (profile.games.length) {
        drawGames(ctx, {
            games: profile.games,
            x: gamesPanelX + 22,
            y: rowY + 74,
            tier
        });
    }

    // --- STATUS ---
    drawPanel(ctx, {
        title: "STATUS",
        items: [
            `Creator : ${profile.creator}`,
            `Vibe : ${profile.vibe}`
        ],
        x: colX(2),
        y: rowY,
        width: colWidth,
        height: grid.height,
        tier
    });

    // --- ACCOUNT ---
    drawPanel(ctx, {
        title: "ACCOUNT",
        items: [
            `Joined : ${joinedDate}`,
            `Discord : ${discordSince}`
        ],
        x: colX(3),
        y: rowY,
        width: colWidth,
        height: grid.height,
        tier
    });

}

async function prepareRenderData(member) {

    const profile = getProfileData(member);
    const levelData = getLevelData(member.id, member.guild.id);

    // Theme menimpa PALET tier (color/glow/soft/border) tapi label tier
    // tetap — rarity tetap jujur, warnanya saja yang custom.
    const baseTier = getTier(member);
    const theme = THEMES[getActiveTheme(member.id, member.guild.id)];
    const tier = theme?.palette ? { ...baseTier, ...theme.palette } : baseTier;

    const [avatarImage, backgroundImage] = await Promise.all([
        loadImage(member.user.displayAvatarURL({ extension: "png", size: 512 })),
        getBackgroundImage()
    ]);

    const joinedDate = profile.joinedAt.toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
    });

    const discordSince = profile.discordSince.toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
    });

    return { profile, tier, levelData, avatarImage, backgroundImage, joinedDate, discordSince };

}

/**
 * Static profile card (PNG). Fast, always works, safe default.
 */
export async function generateProfile(member) {

    const data = await prepareRenderData(member);

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    renderFrame(ctx, { member, ...data, time: 0 });

    const buffer = canvas.toBuffer("image/png");

    return new AttachmentBuilder(buffer, {
        name: "profile.png"
    });

}

/**
 * Animated profile card (GIF) — same design, with ambient particle
 * twinkle and a shimmer sweep across the XP bar looping over `frames`.
 * Rendered at a reduced scale (full res is overkill for an animated
 * GIF and blows up the file size) to stay comfortably under Discord's
 * attachment limit.
 */
export async function generateAnimatedProfile(member, { frames = 14, delay = 80, scale = 0.62 } = {}) {

    const data = await prepareRenderData(member);

    const gif = GIFEncoder();

    const scaledWidth = Math.round(WIDTH * scale);
    const scaledHeight = Math.round(HEIGHT * scale);

    for (let f = 0; f < frames; f++) {

        const time = f / frames;

        const canvas = createCanvas(scaledWidth, scaledHeight);
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        renderFrame(ctx, { member, ...data, time });

        const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
        const palette = quantize(imageData.data, 256);
        const index = applyPalette(imageData.data, palette);

        gif.writeFrame(index, scaledWidth, scaledHeight, { palette, delay });

    }

    gif.finish();

    return new AttachmentBuilder(Buffer.from(gif.bytes()), {
        name: "profile.gif"
    });

}