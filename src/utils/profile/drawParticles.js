/**
 * Small seeded PRNG (mulberry32) so the particle field is stable
 * per-user (seeded by their Discord ID) instead of jittering randomly
 * every time the card is regenerated.
 */
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seedFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash;
}

/**
 * Scatters faint glowing dots across the card for ambient depth.
 * `time` (0..1) offsets the twinkle phase — used by the animated
 * GIF export; a static render just passes time=0.
 */
export function drawParticles(ctx, {
    width,
    height,
    seed,
    count = 55,
    tier,
    time = 0
}) {

    const rand = mulberry32(seedFromString(String(seed)));

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < count; i++) {

        const px = rand() * width;
        const py = rand() * height;
        const size = 0.6 + rand() * 1.8;
        const phase = rand();
        const baseAlpha = 0.08 + rand() * 0.22;

        // gentle twinkle: opacity breathes over the loop, phase-shifted per particle
        const twinkle = 0.5 + 0.5 * Math.sin((time + phase) * Math.PI * 2);
        const alpha = baseAlpha * (0.5 + 0.5 * twinkle);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = tier.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

    }

    ctx.restore();

}