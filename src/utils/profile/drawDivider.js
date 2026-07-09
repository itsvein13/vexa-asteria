export function drawDivider(ctx, x, y, width = 220) {

    ctx.save();

    ctx.beginPath();

    ctx.strokeStyle = "#8B5CF6";
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;

    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);

    ctx.stroke();

    ctx.restore();

}