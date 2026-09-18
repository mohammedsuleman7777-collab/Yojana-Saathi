import Link from "next/link";
import { Building2, Landmark, Tag, CheckCircle2, XCircle, ArrowRight, Bookmark } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function SchemeCard({
  scheme,
  isSaved = false,
  onToggleSave,
  saving = false,
  showEligibility = false,
}) {
  if (!scheme) return null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200">
      <div>
        {/* Top Badges & Save Action */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {scheme.level && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <Landmark className="h-3 w-3" />
                {scheme.level}
              </span>
            )}
            {scheme.department && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                <Building2 className="h-3 w-3" />
                {scheme.department}
              </span>
            )}
            {scheme.status && (
              <StatusBadge status={scheme.status} />
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(scheme)}
              disabled={saving}
              title={isSaved ? "Remove from saved" : "Save scheme"}
              className={`rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-amber-500 ${
                isSaved ? "text-amber-500 bg-amber-50 ring-1 ring-amber-200" : ""
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-amber-500" : ""}`} />
            </button>
          )}
        </div>

        {/* Scheme Title */}
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
          <Link href={`/schemes/${scheme.id}`}>
            {scheme.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {scheme.shortDescription || scheme.description || "No description provided."}
        </p>

        {/* Category & Attributes */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {scheme.category && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-slate-600 border border-slate-100">
              <Tag className="h-3 w-3 text-slate-400" />
              {Array.isArray(scheme.category) ? scheme.category.join(", ") : scheme.category}
            </span>
          )}
          {scheme.state && scheme.state !== "All India" && (
            <span className="rounded bg-slate-50 px-2 py-0.5 text-slate-600 border border-slate-100">
              📍 {scheme.state}
            </span>
          )}
        </div>

        {/* Eligibility Match Strip if requested */}
        {showEligibility && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            {scheme.eligible ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>You meet all eligibility criteria</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg">
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Not eligible for this scheme</span>
                </div>
                {scheme.reasons && scheme.reasons.length > 0 && (
                  <ul className="text-xs text-slate-500 list-disc list-inside pl-1 space-y-0.5 mt-1">
                    {scheme.reasons.slice(0, 2).map((r, i) => (
                      <li key={i} className="line-clamp-1">{r}</li>
                    ))}
                    {scheme.reasons.length > 2 && (
                      <li className="text-slate-400">+{scheme.reasons.length - 2} more criteria</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          href={`/schemes/${scheme.id}`}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group/btn"
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>

        <Link
          href={`/apply/${scheme.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
}
