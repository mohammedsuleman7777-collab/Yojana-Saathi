"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AdminHeader from "@/components/AdminHeader";
import StatusBadge from "@/components/StatusBadge";
import {
  deleteScheme,
  getSchemes,
  toggleSchemeStatus,
} from "@/lib/schemes";
import {
  Layers,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Sliders,
  Power,
  Trash2,
  Loader2,
  AlertCircle,
  Building2,
  Landmark,
} from "lucide-react";

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  async function loadSchemes() {
    try {
      setLoading(true);
      setError("");
      const data = await getSchemes();
      setSchemes(data);
    } catch (err) {
      console.error("Error loading schemes:", err);
      setError("Unable to load schemes catalog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemes();
  }, []);

  async function handleToggleStatus(scheme) {
    try {
      setActionLoading(scheme.id);
      const newStatus = await toggleSchemeStatus(scheme.id, scheme.status);

      setSchemes((prev) =>
        prev.map((item) =>
          item.id === scheme.id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Error changing scheme status:", err);
      setError("Unable to change scheme status.");
    } finally {
      setActionLoading("");
    }
  }

  async function handleDelete(scheme) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${scheme.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(scheme.id);
      await deleteScheme(scheme.id);
      setSchemes((prev) => prev.filter((item) => item.id !== scheme.id));
    } catch (err) {
      console.error("Error deleting scheme:", err);
      setError("Unable to delete scheme.");
    } finally {
      setActionLoading("");
    }
  }

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        scheme.name?.toLowerCase().includes(q) ||
        scheme.department?.toLowerCase().includes(q) ||
        scheme.category?.toLowerCase?.().includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        (scheme.status || "active").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [schemes, searchQuery, statusFilter]);

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <AdminHeader
          title="Schemes Management"
          subtitle="Catalog, configure eligibility logic, activate/deactivate, and audit government programs."
          action={
            <Link
              href="/admin/schemes/add"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Add Scheme
            </Link>
          }
        />

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {["All", "Active", "Inactive"].map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme or department..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Schemes Table & Cards */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs text-slate-500">Loading catalog...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Schemes in Database</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Start by creating the first government welfare directive. You can configure eligibility criteria right after publishing.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/schemes/add"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Add First Scheme
              </Link>
            </div>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">No schemes matched your search query or filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
              className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Scheme Details</th>
                    <th scope="col" className="px-6 py-3.5">Department</th>
                    <th scope="col" className="px-6 py-3.5">Level & State</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchemes.map((scheme) => {
                    const isBusy = actionLoading === scheme.id;
                    const isActive = (scheme.status || "active") === "active";

                    return (
                      <tr key={scheme.id} className="hover:bg-slate-50/70 transition">
                        {/* Scheme Name & ID */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">
                            <Link href={`/admin/schemes/${scheme.id}`} className="hover:text-emerald-700">
                              {scheme.name}
                            </Link>
                          </div>
                          <p className="text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                            {scheme.shortDescription || scheme.description || "No description"}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                            ID: {scheme.id}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {scheme.department || "Not specified"}
                        </td>

                        {/* Level & State */}
                        <td className="px-6 py-4">
                          <span className="inline-block font-semibold text-slate-800">
                            {scheme.level || "Central"}
                          </span>
                          <span className="text-slate-500 block text-[11px]">
                            {scheme.state || "All India"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          <StatusBadge status={scheme.status || "active"} />
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <Link
                              href={`/admin/schemes/${scheme.id}`}
                              title="View Full Scheme"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <Link
                              href={`/admin/schemes/${scheme.id}/edit`}
                              title="Edit Scheme Details"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>

                            <Link
                              href={`/admin/schemes/${scheme.id}/eligibility`}
                              title="Configure Eligibility Criteria"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
                            >
                              <Sliders className="h-3 w-3" />
                              Criteria
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(scheme)}
                              disabled={isBusy}
                              title={isActive ? "Deactivate Scheme" : "Activate Scheme"}
                              className={`rounded-lg p-1.5 transition ${
                                isActive
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {isBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(scheme)}
                              disabled={isBusy}
                              title="Delete Scheme"
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}