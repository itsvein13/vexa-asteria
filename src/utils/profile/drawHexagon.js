/**
 * Traces a flat-topped hexagon path (does not fill/stroke — caller decides).
 * Used for the avatar frame and badge medallions, echoing the hexagon
 * motifs already in the card's background artwork.
 */
export function hexagonPath(ctx, cx, cy, r, rotationDeg = -90) {

    ctx.beginPath();

    for (let i = 0; i < 6; i++) {

        const angle = (Math.PI / 180) * (rotationDeg + i * 60);
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);

    }

    ctx.closePath();

}

/**
 * Angular "HUD panel" outline — a rectangle with the top-left and
 * bottom-right corners cut at 45°, instead of a plain rounded rect.
 */
export function angularPanelPath(ctx, x, y, width, height, cut = 16) {

    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height - cut);
    ctx.lineTo(x + width - cut, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + cut);
    ctx.closePath();

}