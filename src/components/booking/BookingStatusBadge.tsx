const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
  completed: "bg-indigo-50 text-indigo-700",
};

export default function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
        STATUS_STYLES[status] ?? STATUS_STYLES.cancelled
      }`}
    >
      {status}
    </span>
  );
}
