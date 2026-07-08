import {
    createCanvas,
    loadImage
} from "@napi-rs/canvas";

import path from "path";
import { AttachmentBuilder } from "discord.js";

export async function generateProfile(member) {

    console.log("[1] generateProfile()");

    const width = 1280;
    const height = 720;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    console.log("[2] Canvas created");

    // =========================
    // Background
    // =========================

    const bgPath = path.join(
        process.cwd(),
        "src",
        "assets",
        "profile",
        "profile-bg.png"
    );

    console.log("[3] Background path:", bgPath);

    const background = await loadImage(bgPath);

    console.log("[4] Background loaded");

    ctx.drawImage(background, 0, 0, width, height);

    // =========================
    // Avatar
    // =========================

    const avatarUrl = member.user.displayAvatarURL({
        extension: "png",
        size: 512
    });

    console.log("[5] Avatar URL:", avatarUrl);

    const avatar = await loadImage(avatarUrl);

    console.log("[6] Avatar loaded");

    const avatarX = 980;
    const avatarY = 90;
    const avatarSize = 180;

    ctx.save();

    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
        avatar,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
    );

    ctx.restore();

    console.log("[7] Avatar drawn");

    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 4,
        0,
        Math.PI * 2
    );

    ctx.lineWidth = 6;
    ctx.strokeStyle = "#A855F7";
    ctx.stroke();

    console.log("[8] Border drawn");

    const buffer = await canvas.encode("png");

    console.log("[9] PNG encoded");

    return new AttachmentBuilder(buffer, {
        name: "profile.png"
    });

}