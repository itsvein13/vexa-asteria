import { loadImage } from "canvas";
import path from "path";
import fs from "fs";

const ICON_DIR = path.join(process.cwd(), "src", "assets", "icons");

// Cache termasuk hasil null (file tidak ada) — cek disk cuma sekali per icon.
const cache = new Map();

/**
 * Load icon PNG dari assets/icons/<category>/<slug>.png.
 * Balikin Image, atau null kalau slug kosong / file tidak ada /
 * gagal dibaca — caller tinggal fallback, tidak perlu try/catch.
 */
export async function loadIcon(category, slug) {

    if (!slug) return null;

    const key = `${category}/${slug}`;
    if (cache.has(key)) return cache.get(key);

    const file = path.join(ICON_DIR, category, `${slug}.png`);

    let image = null;

    if (fs.existsSync(file)) {
        try {
            image = await loadImage(file);
        } catch {
            image = null;
        }
    }

    cache.set(key, image);
    return image;

}
