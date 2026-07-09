export function drawText(ctx, {
    text,
    x,
    y,
    font,
    color,
    align = "left",
    shadowColor = null,
    shadowBlur = 0
}) {

    ctx.save();

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
    }

    ctx.fillText(text, x, y);

    ctx.restore();

}

/**
 * node-canvas doesn't implement ctx.letterSpacing, so for the
 * spaced-out uppercase "HUD label" look we draw each character
 * individually with a manual gap between them.
 */
export function drawSpacedText(ctx, {
    text,
    x,
    y,
    font,
    color,
    spacing = 3,
    align = "left",
    shadowColor = null,
    shadowBlur = 0
}) {

    ctx.save();

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "left";

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
    }

    const chars = text.split("");
    const widths = chars.map(c => ctx.measureText(c).width);
    const totalWidth = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);

    let startX = x;

    if (align === "center") startX = x - totalWidth / 2;
    if (align === "right") startX = x - totalWidth;

    let cursor = startX;

    for (let i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], cursor, y);
        cursor += widths[i] + spacing;
    }

    ctx.restore();

    return totalWidth;

}

/**
 * Draws text filled with a horizontal gradient between two colors,
 * with an optional glow behind it. Used for the display name hero text.
 */
export function drawGradientText(ctx, {
    text,
    x,
    y,
    font,
    colorFrom,
    colorTo,
    align = "left",
    shadowColor = null,
    shadowBlur = 0
}) {

    ctx.save();

    ctx.font = font;
    ctx.textAlign = align;

    const width = ctx.measureText(text).width;

    let gradX0 = x;
    if (align === "center") gradX0 = x - width / 2;
    if (align === "right") gradX0 = x - width;

    const gradient = ctx.createLinearGradient(gradX0, 0, gradX0 + width, 0);
    gradient.addColorStop(0, colorFrom);
    gradient.addColorStop(1, colorTo);

    ctx.fillStyle = gradient;

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
    }

    ctx.fillText(text, x, y);

    ctx.restore();

    return width;

}