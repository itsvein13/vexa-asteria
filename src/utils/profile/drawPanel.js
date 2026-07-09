import COLORS from "../../config/colors.js";
import FONT from "../../config/fonts.js";
import { angularPanelPath } from "./drawHexagon.js";
import { drawText, drawSpacedText } from "./drawText.js";

/**
 * Angular "HUD" panel: cut corners (top-left / bottom-right), a glowing
 * tier-colored accent stripe along the top edge, a small diamond glyph
 * + letter-spaced uppercase title, and a gradient divider underneath.
 *
 * Pass `height` to force an exact box height regardless of content —
 * used to keep a row of panels lined up at the same size.
 *
 * Returns the Y coordinate right after the panel (bottom edge),
 * so the next section can chain off of it and never overlap.
 */
export function drawPanel(ctx, {
    title,
    items = [],
    x,
    y,
    width = 420,
    padding = 22,
    contentHeight = null,
    height: forcedHeight = null,
    itemColor = null,
    tier
}) {

    const titleHeight = 28;
    const itemHeight = 26;
    const innerTop = 74; // space reserved for title + divider before content starts

    const bodyHeight = contentHeight !== null
        ? contentHeight
        : (items.length * itemHeight);

    const autoHeight = padding + innerTop + bodyHeight + padding - titleHeight;
    const height = forcedHeight !== null ? forcedHeight : autoHeight;
    const cut = 14;

    // ===== Panel background (subtle vertical gradient) =====
    ctx.save();
    angularPanelPath(ctx, x, y, width, height, cut);
    const bgGrad = ctx.createLinearGradient(x, y, x, y + height);
    bgGrad.addColorStop(0, "rgba(255,255,255,0.045)");
    bgGrad.addColorStop(1, "rgba(255,255,255,0.015)");
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.strokeStyle = tier.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ===== Top accent stripe (glowing, tier color) =====
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + width, y);
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = tier.glow;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();

    // ===== Title glyph (small diamond) + letter-spaced label =====
    const glyphCX = x + padding + 3;
    const glyphCY = y + 27;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(glyphCX, glyphCY - 5);
    ctx.lineTo(glyphCX + 5, glyphCY);
    ctx.lineTo(glyphCX, glyphCY + 5);
    ctx.lineTo(glyphCX - 5, glyphCY);
    ctx.closePath();
    ctx.fillStyle = tier.color;
    ctx.shadowColor = tier.glow;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();

    drawSpacedText(ctx, {
        text: title,
        x: x + padding + 14,
        y: y + 32,
        font: FONT.heading,
        color: COLORS.text,
        spacing: 2
    });

    // ===== Divider (gradient fade, under the title) =====
    ctx.save();
    const dividerY = y + 46;
    const dGrad = ctx.createLinearGradient(x + padding, 0, x + width - padding, 0);
    dGrad.addColorStop(0, tier.border);
    dGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + padding, dividerY);
    ctx.lineTo(x + width - padding, dividerY);
    ctx.stroke();
    ctx.restore();

    // ===== Items (plain text-list panels: STATUS / ACCOUNT / BADGES fallback) =====
    let currentY = y + innerTop;

    for (const item of items) {

        drawText(ctx, {
            text: item,
            x: x + padding,
            y: currentY,
            font: FONT.body,
            color: itemColor ?? COLORS.muted
        });

        currentY += itemHeight;

    }

    return y + height;

}