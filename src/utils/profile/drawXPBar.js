import COLORS from "../../config/colors.js";
import FONT from "../../config/fonts.js";
import { drawText } from "./drawText.js";
import { hexagonPath } from "./drawHexagon.js";

export function drawXPBar(ctx, {
    x,
    y,
    width = 280,
    height = 14,
    level = 1,
    currentXP = 0,
    maxXP = 100,
    tier
}) {

    const progress = Math.min(currentXP / maxXP, 1);

    // ===== Level hex badge (left side) =====
    const hexR = 24;
    const hexCX = x + hexR;
    const hexCY = y + height / 2;

    ctx.save();
    hexagonPath(ctx, hexCX, hexCY, hexR);
    const badgeGrad = ctx.createLinearGradient(hexCX, hexCY - hexR, hexCX, hexCY + hexR);
    badgeGrad.addColorStop(0, tier.soft);
    badgeGrad.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = tier.glow;
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.restore();

    drawText(ctx, {
        text: String(level),
        x: hexCX,
        y: hexCY + 7,
        font: FONT.heading,
        color: COLORS.text,
        align: "center",
        shadowColor: tier.glow,
        shadowBlur: 8
    });

    // ===== Bar track =====
    const barX = x + hexR * 2 + 18;
    const barWidth = width;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(barX, y, barWidth, height, height / 2);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fill();
    ctx.strokeStyle = tier.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // ===== Bar fill (gradient + glow) =====
    const fillWidth = Math.max(barWidth * progress, height); // never smaller than a full rounded cap

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(barX, y, fillWidth, height, height / 2);
    ctx.clip();

    const fillGrad = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0);
    fillGrad.addColorStop(0, tier.color);
    fillGrad.addColorStop(1, tier.glow);
    ctx.fillStyle = fillGrad;
    ctx.shadowColor = tier.glow;
    ctx.shadowBlur = 10;
    ctx.fillRect(barX, y, fillWidth, height);

    // Segment ticks — thin dark dividers for a "reactor bar" texture
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(10,10,20,0.35)";
    const segmentWidth = 14;
    for (let sx = barX + segmentWidth; sx < barX + fillWidth; sx += segmentWidth) {
        ctx.fillRect(sx, y, 1.5, height);
    }

    // Bright leading edge
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(barX + fillWidth - 3, y, 3, height);

    ctx.restore();

    // ===== Labels =====
    drawText(ctx, {
        text: "LEVEL",
        x: barX,
        y: y - 10,
        font: FONT.small,
        color: COLORS.muted
    });

    drawText(ctx, {
        text: `${currentXP.toLocaleString()} / ${maxXP.toLocaleString()} XP`,
        x: barX + barWidth,
        y: y - 10,
        font: FONT.small,
        color: tier.color,
        align: "right"
    });

    return y + height;

}