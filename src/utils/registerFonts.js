import { registerFont } from "canvas";
import path from "path";

/**
 * Registrasi font Poppins — dipakai semua modul canvas.
 *
 * Setiap file didaftarkan DUA kali:
 * 1. Family legacy multi-kata ("Poppins Bold") — dipakai profile card
 *    lewat config/fonts.js, jangan diubah biar ga ada regresi.
 * 2. Family tunggal "Poppins" + metadata weight — cara yang dipahami
 *    pango dengan benar untuk string font ber-weight
 *    (mis. "bold 56px Poppins", "600 22px Poppins").
 */

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

const REGULAR = path.join(FONT_DIR, "Poppins-Regular.ttf");
const SEMIBOLD = path.join(FONT_DIR, "Poppins-SemiBold.ttf");
const BOLD = path.join(FONT_DIR, "Poppins-Bold.ttf");

// Legacy (profile card)
registerFont(REGULAR, { family: "Poppins" });
registerFont(BOLD, { family: "Poppins Bold" });
registerFont(SEMIBOLD, { family: "Poppins SemiBold" });

// Weighted single-family (leaderboard card & modul baru)
registerFont(REGULAR, { family: "Poppins", weight: "normal" });
registerFont(SEMIBOLD, { family: "Poppins", weight: "600" });
registerFont(BOLD, { family: "Poppins", weight: "bold" });
