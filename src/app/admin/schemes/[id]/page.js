"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AdminHeader from "@/components/AdminHeader";
import StatusBadge from "@/components/StatusBadge";
import { getSchemeById } from "@/lib/schemes";
import {
  ArrowLeft,
  Building2,
  Landmark,
  Tag,
  Sliders,
  Edit,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";

export default function AdminSchemeViewPage() {
  const params = useParams();
  const schemeId = params?.id;

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScheme() {
      if (!schemeId) return;

      try {
        setLoading(true);
        setError("");
        const data = await getSchemeById(schemeId);

        if (!data) {
          setError("Scheme not found.");
          return;
        }

        setScheme(data);
      } catch (err) {
        console.error("Error loading scheme:", err);
        setError("Unable to load scheme details.");
      } finally {
        setLoading(false);
      }
    }

    loadScheme();
  }, [schemeId]);

  function formatDate(timestamp) {
    if (!timestamp) return "Not available";
    if (timestamp?.toDate) return timestamp.toDate().toLocaleString("en-IN");
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString("en-IN");
    }
    return "Not available";
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading scheme inspection file...
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !scheme) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-600 mb-3" />
            <h1 className="text-xl font-bold text-rose-950">Scheme Not Found</h1>
            <p className="mt-2 text-sm text-rose-800">{error || "Record could not be retrieved."}</p>
            <div className="mt-6">
              <Link
                href="/admin/schemes"
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

  const el = scheme.eligibility || {};

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <AdminHeader
          title={scheme.name}
          subtitle={`ID: ${scheme.id} • Registered under ${scheme.department || "General Administration"}`}
          action={
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/schemes/${scheme.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                <Edit className="h-3.5 w-3.5 text-slate-500" />
                Edit Scheme
              </Link>
              <Link
                href={`/admin/schemes/${scheme.id}/eligibility`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                <Sliders className="h-3.5 w-3.5" />
                Configure Criteria
              </Link>
            </div>
          }
        />

        {/* Overview Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={scheme.status || "active"} />
            <span className="font-semibold text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              {scheme.level || "Central"}
            </span>
            {scheme.department && (
              <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded font-medium">
                {scheme.department}
              </span>
            )}
            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded font-medium">
              📍 {scheme.state || "All India"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {scheme.shortDescription || "No short description provided."}
          </h2>

          {scheme.description && (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line pt-2 border-t border-slate-100">
              {scheme.description}
            </p>
          )}
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Eligibility Rules Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                  <Sliders className="h-4 w-4 text-emerald-600" />
                  Active Eligibility Criteria Rules
                </div>
                <Link
                  href={`/admin/schemes/${scheme.id}/eligibility`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Edit Criteria
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-semibold text-slate-500 block mb-1">Age Limits</span>
                  <span className="text-slate-900 font-bold">
                    {el.age?.min || el.age?.max
                      ? `Min: ${el.age?.min ?? "None"} • Max: ${el.age?.max ?? "None"}`
                      : "No age restriction configured"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-semibold text-slate-500 block mb-1">Income Ceiling</span>
                  <span className="text-slate-900 font-bold">
                    {el.annualIncome?.min || el.annualIncome?.max
                      ? `Min: ₹${el.annualIncome?.min ?? 0} • Max: ₹${el.annualIncome?.max ?? "Unlimited"}`
                      : "No income limit configured"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-semibold text-slate-500 block mb-1">Gender Restriction</span>
                  <span className="text-slate-900 font-bold">
                    {Array.isArray(el.gender) && el.gender.length > 0
                      ? el.gender.join(", ")
                      : "Open to all genders"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-semibold text-slate-500 block mb-1">Target Categories</span>
                  <span className="text-slate-900 font-bold">
                    {Array.isArray(el.category) && el.category.length > 0
                      ? el.category.join(", ")
                      : "All caste / social groups"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-semibold text-slate-500 block mb-1">Eligible Occupations</span>
                  <span className="text-slate-900 font-bold">
                    {Array.isArray(el.occupation) && el.occupation.length > 0
                      ? el.occupation.join(", ")
                      : "Any occupation"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="font-semibold text-slate-500 block mb-1">Disability Requirement</span>
                  <span className="text-slate-900 font-bold">
                    {el.disabilityStatus === true
                      ? "Mandatory Benchmark Disability (PwD)"
                      : el.disabilityStatus === false
                      ? "Non-disabled only"
                      : "No disability restriction"}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits & Documents */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Benefits</h3>
                {Array.isArray(scheme.benefits) ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {scheme.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700">{scheme.benefits || "Not specified"}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">Documents Required</h3>
                {Array.isArray(scheme.documentsRequired) ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {scheme.documentsRequired.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <FileCheck2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700">
                    {scheme.documentsRequired || "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Audit Sidebar (1 Col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Audit & Record Metadata
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block mb-0.5">Created By Admin UID</span>
                  <span className="font-mono text-slate-800 break-all">{scheme.createdBy || "N/A"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Published Date</span>
                  <span className="font-medium text-slate-800">{formatDate(scheme.createdAt)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Last Modification</span>
                  <span className="font-medium text-slate-800">{formatDate(scheme.updatedAt)}</span>
                </div>

                {scheme.applicationUrl && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-slate-400 block mb-1">Official Portal URL</span>
                    <a
                      href={scheme.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 font-semibold break-all hover:underline"
                    >
                      {scheme.applicationUrl}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}