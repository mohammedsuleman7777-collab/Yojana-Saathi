"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getSchemeById } from "@/lib/schemes";
import { updateSavedSchemes } from "@/lib/auth";
import SchemeCard from "@/components/SchemeCard";
import {
  Bookmark,
  ArrowLeft,
  Search,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";

export default function SavedSchemesPage() {
  const { user, profile } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    async function loadSavedSchemes() {
      const savedIds = profile?.savedSchemes || [];

      if (savedIds.length === 0) {
        setSchemes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await Promise.all(savedIds.map((id) => getSchemeById(id)));
        setSchemes(results.filter(Boolean));
      } catch (err) {
        console.error("Error loading bookmarked schemes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSavedSchemes();
  }, [profile]);

  async function handleRemove(scheme) {
    if (!user || removingId) return;

    try {
      setRemovingId(scheme.id);
      const currentSaved = profile?.savedSchemes || [];
      const updated = currentSaved.filter((id) => id !== scheme.id);

      await updateSavedSchemes(user.uid, updated);
      if (profile) {
        profile.savedSchemes = updated;
      }
      setSchemes((prev) => prev.filter((s) => s.id !== scheme.id));
    } catch (err) {
      console.error("Error removing saved scheme:", err);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Saved & Bookmarked Schemes
              </h1>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                {schemes.length}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Government schemes you have earmarked for upcoming application cycles.
            </p>
          </div>

          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Search className="h-4 w-4" />
            Explore More Schemes
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              No Saved Schemes Yet
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              When exploring the welfare catalog, click the bookmark button on any scheme to save it here for convenient review and fast application.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/schemes"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <Search className="h-4 w-4" />
                Browse Schemes
              </Link>
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Check Eligibility
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                isSaved={true}
                onToggleSave={handleRemove}
                saving={removingId === scheme.id}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}