import LAYOUT from "../../config/layout.js";
import { hexagonPath } from "./drawHexagon.js";

export function drawAvatar(ctx, avatarImage, tier) {

    const { x, y, size } = LAYOUT.avatar;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;

    // ===== Outer glow halo (soft, blurred) =====
    ctx.save();
    hexagonPath(ctx, cx, cy, r + 6);
    ctx.strokeStyle = tier.glow;
    ctx.lineWidth = 3;
    ctx.shadowColor = tier.glow;
    ctx.shadowBlur = 35;
    ctx.stroke();
    ctx.restore();

    // ===== Clip + draw avatar image inside the hexagon =====
    ctx.save();
    hexagonPath(ctx, cx, cy, r);
    ctx.clip();
    ctx.drawImage(avatarImage, x, y, size, size);
    ctx.restore();

    // ===== Crisp inner ring =====
    ctx.save();
    hexagonPath(ctx, cx, cy, r);
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 4;
    ctx.shadowColor = tier.color;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.restore();

    // ===== Thin outer ring (a little further out, dimmer) =====
    ctx.save();
    hexagonPath(ctx, cx, cy, r + 10);
    ctx.strokeStyle = tier.soft;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ===== Vertex accent ticks (small glowing dots at each corner) =====
    ctx.save();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (-90 + i * 60);
        const px = cx + (r + 10) * Math.cos(angle);
        const py = cy + (r + 10) * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = tier.color;
        ctx.shadowColor = tier.glow;
        ctx.shadowBlur = 8;
        ctx.fill();
    }
    ctx.restore();

}