"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getUserApplications } from "@/lib/applications";
import StatusBadge from "@/components/StatusBadge";
import {
  FileText,
  ArrowLeft,
  Search,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadApplications() {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const data = await getUserApplications(user.uid);
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setApplications(data);
      } catch (err) {
        console.error("Error loading applications:", err);
        setError("Unable to load your applications. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [user]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "All" ||
        (app.status || "Pending").toLowerCase() === statusFilter.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        app.schemeName?.toLowerCase().includes(query) ||
        app.id?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  function formatDate(timestamp) {
    if (!timestamp?.seconds) return "Recently";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => (a.status || "Pending") === "Pending").length,
    review: applications.filter((a) => a.status === "Under Review").length,
    approved: applications.filter((a) => a.status === "Approved").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

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
                My Scheme Applications
              </h1>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
                {applications.length} Total
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Track the progress, document review, and status changes of all submitted schemes.
            </p>
          </div>

          <Link
            href="/eligibility"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition self-start sm:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            Find New Schemes
          </Link>
        </div>

        {/* Filter Bar & Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "All", count: counts.all },
                { label: "Pending", count: counts.pending },
                { label: "Under Review", count: counts.review },
                { label: "Approved", count: counts.approved },
                { label: "Rejected", count: counts.rejected },
              ].map((tab) => {
                const isActive = statusFilter === tab.label;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setStatusFilter(tab.label)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive ? "bg-slate-700 text-slate-200" : "bg-white text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              No Applications Submitted Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You have not applied for any central or state welfare programs. Explore eligible programs matching your profile and submit your first digital application.
            </p>
            <div className="pt-2">
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                Find Eligible Schemes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && applications.length > 0 && (
          <div>
            {filteredApplications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-700">No applications match your selected filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("All");
                    setSearchQuery("");
                  }}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const isRejected = application.status === "Rejected";

                  return (
                    <div
                      key={application.id}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={application.status || "Pending"} />
                            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              ID: {application.id}
                            </span>
                          </div>

                          <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            <Link href={`/applications/${application.id}`}>
                              {application.schemeName || "Government Welfare Scheme"}
                            </Link>
                          </h2>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>Submitted on {formatDate(application.createdAt)}</span>
                            </div>
                            <div>
                              <span>Applicant: </span>
                              <strong className="text-slate-700">
                                {application.userName || user.email}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                          <Link
                            href={`/applications/${application.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition shadow-sm"
                          >
                            Track Status
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Rejection Alert Box */}
                      {isRejected && application.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-900">
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            Official Rejection Remark:
                          </div>
                          <p className="pl-5 text-rose-700 leading-relaxed">
                            {application.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}