import { hexagonPath } from "./drawHexagon.js";
import { drawText } from "./drawText.js";
import FONT from "../../config/fonts.js";
import COLORS from "../../config/colors.js";

const MEDAL_R = 26;
const COL_GAP = 24;
const ROW_GAP = 16;
const COLUMNS = 4;

/**
 * Returns how tall a badge medallion grid will be for N badges,
 * without drawing anything — used to size the panel before it's drawn.
 */
export function getBadgesGridHeight(count) {

    if (count === 0) return 28;

    const rows = Math.ceil(count / COLUMNS);
    return rows * (MEDAL_R * 2 + ROW_GAP + 16); // medallion + caption + row gap

}

/**
 * Draws badges as glowing hexagon medallions (emoji centered, label
 * caption underneath) instead of a plain text list — reads like
 * in-game achievement icons rather than a bullet list.
 */
export function drawBadges(ctx, {
    badges,
    x,
    y,
    tier
}) {

    const rowHeight = MEDAL_R * 2 + ROW_GAP + 16;

    badges.forEach((badge, i) => {

        const col = i % COLUMNS;
        const row = Math.floor(i / COLUMNS);

        const cx = x + MEDAL_R + col * (MEDAL_R * 2 + COL_GAP);
        const cy = y + MEDAL_R + row * rowHeight;

        // Glow ring
        ctx.save();
        hexagonPath(ctx, cx, cy, MEDAL_R);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, MEDAL_R);
        grad.addColorStop(0, tier.soft);
        grad.addColorStop(1, "rgba(255,255,255,0.02)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = tier.color;
        ctx.lineWidth = 1.75;
        ctx.shadowColor = tier.glow;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // Emoji
        drawText(ctx, {
            text: badge.emoji,
            x: cx,
            y: cy + 8,
            font: "22px Poppins",
            color: COLORS.text,
            align: "center"
        });

        // Caption
        drawText(ctx, {
            text: badge.label,
            x: cx,
            y: cy + MEDAL_R + 16,
            font: FONT.small,
            color: COLORS.muted,
            align: "center"
        });

    });

}