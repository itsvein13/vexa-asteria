export function drawSection(ctx, options) {

    const {
        title,
        items,
        x,
        y
    } = options;

    // Title

    ctx.save();

    ctx.font = "18px Poppins SemiBold";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";

    ctx.fillText(
        title,
        x,
        y
    );

    // Content

    ctx.font = "17px Poppins";
    ctx.fillStyle = "#CFCFCF";

    let currentY = y + 35;

    for (const item of items) {

        ctx.fillText(
            item,
            x,
            currentY
        );

        currentY += 28;

    }

    ctx.restore();

}