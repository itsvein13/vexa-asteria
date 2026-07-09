import { createCanvas, loadImage } from "canvas";
import { AttachmentBuilder } from "discord.js";
import path from "path";
import "../registerFonts.js"; // registrasi font Poppins (shared)

import COLORS from "../../config/colors.js";
import { getLeaderboard } from "../../database/levels.js";
import { hexagonPath, angularPanelPath } from "../profile/drawHexagon.js";
import { drawText, drawSpacedText, drawGradientText } from "../profile/drawText.js";
import { drawBackground } from "../profile/drawBackground.js";

const WIDTH = 1672;
const HEIGHT = 941;

import fs from "fs";

// Background khusus leaderboard (polos, tanpa judul bawaan).
// Kalau file-nya belum ada, fallback ke background profile supaya
// kartu tetap ter-render.
const LEADERBOARD_BG = path.join(
    process.cwd(), "src", "assets", "leaderboard", "leaderboard-bg.png"
);

const FALLBACK_BG = path.join(
    process.cwd(), "src", "assets", "profile", "profile-bg.png"
);

let cachedBackground = null;
async function getBackgroundImage() {
    if (!cachedBackground) {
        const bgPath = fs.existsSync(LEADERBOARD_BG) ? LEADERBOARD_BG : FALLBACK_BG;
        cachedBackground = await loadImage(bgPath);
    }
    return cachedBackground;
}

// Palet podium — struktur sama dengan tier (color/glow/soft/border)
// biar konsisten dengan bahasa desain kartu lain.
const PODIUM = [

    { // 1 — gold
        color: "#FFD54F", glow: "#FFC107",
        soft: "rgba(255,213,79,0.14)", border: "rgba(255,213,79,0.4)"
    },

    { // 2 — silver
        color: "#C7D2E0", glow: "#AAB8CC",
        soft: "rgba(199,210,224,0.14)", border: "rgba(199,210,224,0.4)"
    },

    { // 3 — bronze
        color: "#E09A5C", glow: "#C97C3D",
        soft: "rgba(224,154,92,0.14)", border: "rgba(224,154,92,0.4)"
    }

];

/**
 * Avatar hexagon di posisi bebas — versi parametris dari drawAvatar
 * profile card (yang terikat LAYOUT.avatar).
 */
function drawHexAvatar(ctx, { image, cx, cy, r, palette }) {

    // Glow halo
    ctx.save();
    hexagonPath(ctx, cx, cy, r + 5);
    ctx.strokeStyle = palette.glow;
    ctx.lineWidth = 3;
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.restore();

    // Clip + gambar avatar
    ctx.save();
    hexagonPath(ctx, cx, cy, r);
    ctx.clip();
    ctx.drawImage(image, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    // Ring dalam
    ctx.save();
    hexagonPath(ctx, cx, cy, r);
    ctx.strokeStyle = palette.color;
    ctx.lineWidth = 4;
    ctx.shadowColor = palette.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

}

function drawPodiumSpot(ctx, { entry, user, image, cx, cy, r, rank }) {

    const palette = PODIUM[rank - 1];

    drawHexAvatar(ctx, { image, cx, cy, r, palette });

    // Nomor rank di atas avatar
    drawText(ctx, {
        text: `#${rank}`,
        x: cx,
        y: cy - r - 22,
        font: "bold 32px Poppins",
        color: palette.color,
        align: "center",
        shadowColor: palette.glow,
        shadowBlur: 14
    });

    // Nama + level di bawah avatar
    const name = user?.displayName ?? user?.username ?? "Unknown";

    drawText(ctx, {
        text: name.length > 16 ? name.slice(0, 15) + "…" : name,
        x: cx,
        y: cy + r + 46,
        font: "600 26px Poppins",
        color: COLORS.text,
        align: "center"
    });

    drawText(ctx, {
        text: `LVL ${entry.level} • ${entry.totalXP.toLocaleString()} XP`,
        x: cx,
        y: cy + r + 78,
        font: "20px Poppins",
        color: COLORS.muted,
        align: "center"
    });

}

/**
 * Kartu leaderboard statis (PNG): podium top 3 + list rank 4-10.
 * `client` dipakai fetch user (nama + avatar) — tetap jalan walau
 * member sudah keluar server (nama di-fallback).
 */
export async function generateLeaderboardCard(guild, client) {

    const entries = getLeaderboard(guild.id, 10, 0);
    if (entries.length === 0) return null;

    // Fetch semua user + avatar top 3 paralel
    const users = await Promise.all(
        entries.map(e => client.users.fetch(e.userId).catch(() => null))
    );

    const backgroundImage = await getBackgroundImage();

    const avatarImages = await Promise.all(
        entries.slice(0, 3).map((e, i) => {

            const url = users[i]?.displayAvatarURL({ extension: "png", size: 256 });
            if (!url) return null;

            return loadImage(url).catch(() => null);

        })
    );

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx, backgroundImage, WIDTH, HEIGHT);

    // ===== Judul =====
    drawGradientText(ctx, {
        text: "LEADERBOARD",
        x: WIDTH / 2,
        y: 96,
        font: "bold 56px Poppins",
        colorFrom: COLORS.accent,
        colorTo: COLORS.gold,
        align: "center",
        shadowColor: COLORS.accent,
        shadowBlur: 24
    });

    drawSpacedText(ctx, {
        text: guild.name.toUpperCase(),
        x: WIDTH / 2,
        y: 132,
        font: "600 20px Poppins",
        color: COLORS.muted,
        spacing: 4,
        align: "center"
    });

    // ===== Podium (1 tengah-besar, 2 kiri, 3 kanan) =====
    const podiumSpots = [
        { rank: 1, cx: WIDTH / 2, cy: 300, r: 95 },
        { rank: 2, cx: WIDTH / 2 - 300, cy: 335, r: 72 },
        { rank: 3, cx: WIDTH / 2 + 300, cy: 335, r: 72 }
    ];

    for (const spot of podiumSpots) {

        const idx = spot.rank - 1;
        if (!entries[idx]) continue;

        if (avatarImages[idx]) {
            drawPodiumSpot(ctx, {
                entry: entries[idx],
                user: users[idx],
                image: avatarImages[idx],
                ...spot
            });
        }

    }

    // ===== List rank 4-10 =====
    const rest = entries.slice(3);

    if (rest.length) {

        const panelX = 210;
        const panelW = WIDTH - panelX * 2;
        const panelY = 545;
        const rowH = 46;
        const panelH = 44 + rest.length * rowH;

        ctx.save();
        angularPanelPath(ctx, panelX, panelY, panelW, panelH, 16);
        const grad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
        grad.addColorStop(0, "rgba(255,255,255,0.045)");
        grad.addColorStop(1, "rgba(255,255,255,0.015)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(168,85,247,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        rest.forEach((entry, i) => {

            const rank = i + 4;
            const user = users[i + 3];
            const rowY = panelY + 58 + i * rowH;
            const name = user?.displayName ?? user?.username ?? "Unknown";

            drawText(ctx, {
                text: `#${rank}`,
                x: panelX + 40,
                y: rowY,
                font: "bold 22px Poppins",
                color: COLORS.accent
            });

            drawText(ctx, {
                text: name.length > 28 ? name.slice(0, 27) + "…" : name,
                x: panelX + 120,
                y: rowY,
                font: "600 22px Poppins",
                color: COLORS.text
            });

            drawText(ctx, {
                text: `LVL ${entry.level}`,
                x: panelX + panelW - 260,
                y: rowY,
                font: "22px Poppins",
                color: COLORS.muted,
                align: "right"
            });

            drawText(ctx, {
                text: `${entry.totalXP.toLocaleString()} XP`,
                x: panelX + panelW - 40,
                y: rowY,
                font: "600 22px Poppins",
                color: COLORS.gold,
                align: "right"
            });

        });

    }

    const buffer = canvas.toBuffer("image/png");

    return new AttachmentBuilder(buffer, {
        name: "leaderboard.png"
    });

}
