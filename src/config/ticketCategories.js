// Kategori tiket — ditampilkan sebagai select menu waktu member klik
// "Open Ticket". id disimpan di database, label/description/emoji
// cuma buat tampilan. Nambah kategori baru? Tinggal tambah satu object.
const TICKET_CATEGORIES = [
    {
        id: "design",
        emoji: "🎨",
        label: "Design & Video Editing",
        description: "Video Editing, Graphic, Clothing, UI/UX Design"
    },
    {
        id: "programming",
        emoji: "💻",
        label: "Web & App Development",
        description: "Web Programming, SaaS, Mobile Apps"
    },
    {
        id: "cinematic",
        emoji: "🎬",
        label: "FiveM & NFS Cinematic",
        description: "Cinematic, Foto, dan Editing Include"
    },
    {
        id: "complaint",
        emoji: "⚠️",
        label: "Complain",
        description: "Keluhan atau laporan masalah"
    },
    {
        id: "general",
        emoji: "💬",
        label: "General Inquiry",
        description: "Pertanyaan umum, partnership, atau hal lain di luar kategori atas"
    }
];

export default TICKET_CATEGORIES;

export function getTicketCategory(id) {
    return TICKET_CATEGORIES.find(c => c.id === id) ?? null;
}
