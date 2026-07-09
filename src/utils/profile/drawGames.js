import { drawChip } from "./drawChip.js";
import FONT from "../../config/fonts.js";

const COLUMNS = 2;
const CHIP_WIDTH = 145;
const COLUMN_GAP = 16;
const ROW_HEIGHT = 42;
const MAX_VISIBLE = 5; // safety cap so games can't overflow the fixed-height panel

/**
 * Returns how tall the chip grid will be for a given game count,
 * WITHOUT drawing anything. Used to size the panel before it's drawn.
 */
export function getGamesGridHeight(gameCount) {

    if (gameCount === 0) return 28; // fallback text line height

    const visibleCount = Math.min(gameCount, MAX_VISIBLE) + (gameCount > MAX_VISIBLE ? 1 : 0);
    const rows = Math.ceil(visibleCount / COLUMNS);

    return rows * ROW_HEIGHT;

}

/**
 * Draws games as a compact 2-column chip grid, capped at MAX_VISIBLE
 * (+ "N more" indicator) so it always fits inside its panel.
 */
export function drawGames(ctx, {

    games,

    icons = {},

    x,

    y,

    tier

}) {

    const visible = games.slice(0, MAX_VISIBLE);
    const extra = games.length - visible.length;

    const chips = extra > 0
        ? [...visible, `+${extra} more`]
        : visible;

    chips.forEach((game, i) => {

        const col = i % COLUMNS;
        const row = Math.floor(i / COLUMNS);

        drawChip(ctx, {
            text: game,
            icon: icons[game] ?? null, // "+N more" tidak punya icon
            x: x + col * (CHIP_WIDTH + COLUMN_GAP),
            y: y + row * ROW_HEIGHT,
            width: CHIP_WIDTH,
            font: FONT.small,
            tier
        });

    });

}