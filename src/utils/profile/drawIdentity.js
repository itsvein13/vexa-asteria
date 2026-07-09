import { drawGradientText, drawText, drawSpacedText } from "./drawText.js";
import { drawRoundedRect } from "./drawRoundedRect.js";

import COLORS from "../../config/colors.js";
import FONT from "../../config/fonts.js";
import LAYOUT from "../../config/layout.js";

/**
 * Normalizes text so stylized/decorative Unicode nicknames
 * (math bold/script/fraktur, fullwidth, ligatures, etc.) fall back
 * to their plain-letter equivalent. Poppins doesn't ship glyphs for
 * those Unicode blocks, so without this, those characters render
 * as nothing and the name looks cut off (e.g. only "V" showing).
 * Regular accented letters (é, ñ, etc.) are unaffected.
 */
function safeText(text) {
    return text.normalize("NFKC");
}

export function drawIdentity(ctx, profile, tier) {

    const x = LAYOUT.panel.x;

    // ===== Display name — gradient hero text with glow =====
    drawGradientText(ctx, {
        text: safeText(profile.displayName),
        x,
        y: 430,
        font: FONT.title,
        colorFrom: COLORS.text,
        colorTo: tier.color,
        shadowColor: tier.glow,
        shadowBlur: 22
    });

    // ===== Username =====
    drawText(ctx, {
        text: "@" + safeText(profile.username),
        x,
        y: 465,
        font: FONT.subtitle,
        color: COLORS.muted
    });

    // ===== Tier tag chip (replaces the plain role text) =====
    const tagY = 483;
    const tagPaddingX = 12;
    const tagHeight = 26;

    ctx.save();
    ctx.font = FONT.small;
    const tagTextWidth = ctx.measureText(tier.label).width + 14; // + room for the spacing added below
    ctx.restore();

    const tagWidth = tagTextWidth + tagPaddingX * 2;

    drawRoundedRect(ctx, {
        x,
        y: tagY,
        width: tagWidth,
        height: tagHeight,
        radius: 6,
        fillStyle: tier.soft,
        strokeStyle: tier.border,
        lineWidth: 1.5
    });

    drawSpacedText(ctx, {
        text: tier.label,
        x: x + tagPaddingX,
        y: tagY + 18,
        font: FONT.small,
        color: tier.color,
        spacing: 2,
        shadowColor: tier.glow,
        shadowBlur: 6
    });

    // Bottom Y of the identity block, so the caller can chain the
    // next section with a safe gap instead of guessing a hardcoded number.
    return tagY + tagHeight;

}