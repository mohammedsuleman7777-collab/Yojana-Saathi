"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getSchemeById } from "@/lib/schemes";
import { updateSavedSchemes } from "@/lib/auth";
import { hasUserApplied } from "@/lib/applications";
import StatusBadge from "@/components/StatusBadge";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Landmark,
  Tag,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function SchemeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params?.id;

  const { user, profile } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [applied, setApplied] = useState(false);
  const [applicationChecking, setApplicationChecking] = useState(true);

  // Load scheme
  useEffect(() => {
    async function loadScheme() {
      if (!schemeId) return;

      try {
        setLoading(true);
        setError("");

        const schemeData = await getSchemeById(schemeId);

        if (!schemeData) {
          setError("Scheme not found or has been discontinued.");
          return;
        }

        setScheme(schemeData);
      } catch (err) {
        console.error("Error loading scheme:", err);
        setError("Unable to load scheme details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadScheme();
  }, [schemeId]);

  // Check saved state
  useEffect(() => {
    if (!scheme || !profile) return;
    const savedSchemes = profile.savedSchemes || [];
    setSaved(savedSchemes.includes(scheme.id));
  }, [scheme, profile]);

  // Check applied state
  useEffect(() => {
    async function checkApplication() {
      if (!user || !scheme) {
        setApplicationChecking(false);
        return;
      }

      try {
        const alreadyApplied = await hasUserApplied(user.uid, scheme.id);
        setApplied(alreadyApplied);
      } catch (err) {
        console.error("Error checking application status:", err);
      } finally {
        setApplicationChecking(false);
      }
    }

    checkApplication();
  }, [user, scheme]);

  // Handle save toggle
  async function handleSave() {
    if (!user || !scheme || saving) return;

    try {
      setSaving(true);
      const currentSavedSchemes = profile?.savedSchemes || [];

      let updated;
      if (currentSavedSchemes.includes(scheme.id)) {
        updated = currentSavedSchemes.filter((id) => id !== scheme.id);
        setSaved(false);
      } else {
        updated = [...currentSavedSchemes, scheme.id];
        setSaved(true);
      }

      await updateSavedSchemes(user.uid, updated);
      if (profile) {
        profile.savedSchemes = updated;
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setSaved((prev) => !prev);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading scheme dossier...
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !scheme) {
    return (
      <AuthGuard>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-600 mb-3" />
            <h1 className="text-xl font-bold text-rose-950">Scheme Not Found</h1>
            <p className="mt-2 text-sm text-rose-800">{error || "The requested scheme does not exist."}</p>
            <div className="mt-6">
              <Link
                href="/schemes"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Schemes Directory
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Schemes
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
              saved
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-amber-500 text-amber-500" : ""}`} />
            {saving ? "Updating..." : saved ? "Bookmarked" : "Save Scheme"}
          </button>
        </div>

        {/* Scheme Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {scheme.level && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <Landmark className="h-3 w-3" />
                {scheme.level} Level
              </span>
            )}
            {scheme.department && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                <Building2 className="h-3 w-3" />
                {scheme.department}
              </span>
            )}
            {scheme.status && <StatusBadge status={scheme.status} />}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {scheme.name}
          </h1>

          {scheme.shortDescription && (
            <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-4xl">
              {scheme.shortDescription}
            </p>
          )}

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-y-3 gap-x-8 text-xs text-slate-500">
            {scheme.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>Category:</strong>{" "}
                  {Array.isArray(scheme.category) ? scheme.category.join(", ") : scheme.category}
                </span>
              </div>
            )}
            {scheme.state && (
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>
                  <strong>Applicable State:</strong> {scheme.state}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Government Directive</span>
            </div>
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {scheme.description && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Scheme Overview</h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                  {scheme.description}
                </div>
              </section>
            )}

            {/* Benefits */}
            {scheme.benefits && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Benefits & Entitlements</h2>
                {Array.isArray(scheme.benefits) ? (
                  <ul className="space-y-2.5">
                    {scheme.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {scheme.benefits}
                  </p>
                )}
              </section>
            )}

            {/* Documents Required */}
            {scheme.documentsRequired && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Required Documents</h2>
                {Array.isArray(scheme.documentsRequired) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scheme.documentsRequired.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs font-medium text-slate-800"
                      >
                        <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {scheme.documentsRequired}
                  </p>
                )}
              </section>
            )}

            {/* Application Process */}
            {scheme.applicationProcess && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">How to Apply</h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
                  {scheme.applicationProcess}
                </div>
              </section>
            )}
          </div>

          {/* Sticky Sidebar (1 Column) */}
          <div className="space-y-6">
            {/* Application Action Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24 space-y-5">
              <h3 className="text-base font-bold text-slate-900">Application Status</h3>

              {applicationChecking ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  Checking your application record...
                </div>
              ) : applied ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Application Already Submitted
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    You have an active application logged for this scheme.
                  </p>
                  <Link
                    href="/applications"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                  >
                    View My Applications
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href={`/apply/${scheme.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition"
                  >
                    Apply for this Scheme
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/eligibility"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Verify My Eligibility
                  </Link>
                </div>
              )}

              {scheme.applicationUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2 font-medium">Official Government Portal:</p>
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-200 transition"
                  >
                    Apply on Official Website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Citizen Helpdesk notice */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Need Guidance?</p>
                <p>Call national citizen helpline 1800-11-2026 for document verification inquiries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}