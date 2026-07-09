import FONT from "../../config/fonts.js";
import COLORS from "../../config/colors.js";
import { drawText } from "./drawText.js";

export function drawChip(ctx, {

    text,

    x,

    y,

    width = 180,

    height = 34,

    font = null,

    tier = null

}) {

    const accent = tier?.color ?? "#A855F7";
    const border = tier?.border ?? "rgba(168,85,247,.3)";

    ctx.save();

    // Background
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 999);

    const grad = ctx.createLinearGradient(x, y, x + width, y);
    grad.addColorStop(0, "rgba(255,255,255,.07)");
    grad.addColorStop(1, "rgba(255,255,255,.03)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Small accent dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + 14, y + height / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    drawText(ctx, {

        text,

        x: x + 24,

        y: y + height / 2 + 5,

        font: font ?? FONT.body,

        color: COLORS.text

    });

}