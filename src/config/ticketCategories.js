// Kategori tiket — ditampilkan sebagai select menu waktu member klik
// "Open Ticket". id disimpan di database, label/description/emoji
// cuma buat tampilan. Nambah kategori baru? Tinggal tambah satu object.
//
// reviewable: true = begitu tiket kategori ini ditutup, pembuatnya
// di-DM buat kasih rating/testimoni (dipakai testimonial system).
// Cuma kategori jasa berbayar yang masuk akal diminta review — Complain
// dan General sengaja false (aneh nyuruh orang kasih bintang 5 abis
// komplain).
const TICKET_CATEGORIES = [
    {
        id: "design",
        emoji: "🎨",
        label: "Design & Video Editing",
        description: "Video Editing, Graphic, Clothing, UI/UX Design",
        reviewable: true
    },
    {
        id: "programming",
        emoji: "💻",
        label: "Web & App Development",
        description: "Web Programming, SaaS, Mobile Apps",
        reviewable: true
    },
    {
        id: "cinematic",
        emoji: "🎬",
        label: "FiveM & NFS Cinematic",
        description: "Cinematic, Foto, dan Editing Include",
        reviewable: true
    },
    {
        id: "complaint",
        emoji: "⚠️",
        label: "Complain",
        description: "Keluhan atau laporan masalah",
        reviewable: false
    },
    {
        id: "general",
        emoji: "💬",
        label: "General Inquiry",
        description: "Pertanyaan umum, partnership, atau hal lain di luar kategori atas",
        reviewable: false
    }
];

export default TICKET_CATEGORIES;

export function getTicketCategory(id) {
    return TICKET_CATEGORIES.find(c => c.id === id) ?? null;
}
