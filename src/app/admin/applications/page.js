"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AdminHeader from "@/components/AdminHeader";
import StatusBadge from "@/components/StatusBadge";
import { getAllApplications } from "@/lib/applications";
import {
  FileText,
  Search,
  Calendar,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllApplications();
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setApplications(data);
      } catch (err) {
        console.error("Error loading applications:", err);
        setError("Unable to load citizen applications.");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return applications.filter((app) => {
      const applicantName = (app.userName || app.name || "").toLowerCase();
      const applicantEmail = (app.userEmail || app.email || "").toLowerCase();
      const schemeName = (app.schemeName || "").toLowerCase();

      const matchesSearch =
        search === "" ||
        applicantName.includes(search) ||
        applicantEmail.includes(search) ||
        schemeName.includes(search);

      const applicationStatus = app.status || "Pending";
      const matchesStatus =
        statusFilter === "All" || applicationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

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
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <AdminHeader
          title="Applications Review Queue"
          subtitle="Audit incoming citizen requests, inspect attached dossiers, and issue sanction decisions."
        />

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
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

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant or scheme..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Applications Content */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs text-slate-500">Loading citizen applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Applications Submitted</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              When citizens apply for active schemes, their submissions will appear here for administrative verification.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">No applications matched your search or filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
              className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Applicant Dossier</th>
                    <th scope="col" className="px-6 py-3.5">Scheme Applied</th>
                    <th scope="col" className="px-6 py-3.5">Date</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      {/* Applicant Info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {app.userName || app.name || "Unknown Citizen"}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {app.userEmail || app.email || "No email"}
                        </div>
                        {app.phone && (
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            +91 {app.phone}
                          </div>
                        )}
                      </td>

                      {/* Scheme Info */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {app.schemeName || "N/A"}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {app.schemeId || app.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(app.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status || "Pending"} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          Review
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}