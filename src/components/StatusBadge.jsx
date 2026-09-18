export default function StatusBadge({ status, className = "" }) {
  const normalized = (status || "pending").toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case "approved":
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
      case "under review":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
      case "inactive":
        return "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
    }
  };

  const getDot = () => {
    switch (normalized) {
      case "approved":
      case "active":
        return "bg-emerald-500";
      case "under review":
        return "bg-blue-500 animate-pulse";
      case "rejected":
        return "bg-rose-500";
      case "inactive":
        return "bg-slate-400";
      case "pending":
      default:
        return "bg-amber-500";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ring-inset ${getStyle()} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDot()}`} />
      <span className="capitalize">{status || "Pending"}</span>
    </span>
  );
}
