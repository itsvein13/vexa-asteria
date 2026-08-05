// Status progres tiket jasa — diset staff lewat /ticket-status.
// Terpisah dari `status` (open/closed) di database: ini soal progres
// pengerjaan, bukan siklus hidup tiketnya.
const TICKET_ORDER_STATUSES = [
    { id: "in_progress", emoji: "🔧", label: "In Progress" },
    { id: "awaiting_payment", emoji: "💰", label: "Awaiting Payment" },
    { id: "completed", emoji: "✅", label: "Completed" }
];

export default TICKET_ORDER_STATUSES;

export function getOrderStatus(id) {
    return TICKET_ORDER_STATUSES.find(s => s.id === id) ?? null;
}
