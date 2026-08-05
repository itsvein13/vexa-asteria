/**
 * Preset tangga milestone referral — dipakai /referral-rewards-setup
 * buat bikin default sekali klik. Angka reward dikalibrasi biar
 * sepadan sama economy yang udah ada (daily ~50-85/hari, level-up
 * level*10, theme termahal 3000) — bukan angka ngasal.
 *
 * Ini HANYA preset default. Milestone sesungguhnya disimpan di
 * database (tabel referral_milestones), jadi admin bisa menambah/
 * menghapus tingkatan lain kapan saja lewat /referral-milestone-add
 * dan /referral-milestone-remove tanpa perlu redeploy kode.
 */
const REFERRAL_MILESTONE_PRESET = [
    { threshold: 3, reward: 300, emoji: "🥉", label: "Bronze Recruiter" },
    { threshold: 5, reward: 600, emoji: "🥈", label: "Silver Recruiter" },
    { threshold: 10, reward: 1500, emoji: "🥇", label: "Gold Recruiter" },
    { threshold: 25, reward: 4000, emoji: "💎", label: "Platinum Recruiter" },
    { threshold: 50, reward: 10000, emoji: "👑", label: "Legendary Recruiter" }
];

export default REFERRAL_MILESTONE_PRESET;
