export function drawRoundedRect(ctx, {
    x,
    y,
    width,
    height,
    radius = 20,
    fillStyle = null,
    strokeStyle = null,
    lineWidth = 0
}) {

    ctx.save();

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);

    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }

    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    ctx.restore();

}