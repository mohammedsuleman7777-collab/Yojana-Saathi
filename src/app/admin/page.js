"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/AdminHeader";
import { getSchemes } from "@/lib/schemes";
import { getAllApplications } from "@/lib/applications";
import {
  Layers,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [schemesData, appsData] = await Promise.all([
          getSchemes().catch(() => []),
          getAllApplications().catch(() => []),
        ]);
        setSchemes(schemesData);
        setApplications(appsData);
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const activeSchemesCount = schemes.filter((s) => s.status === "active").length;
  const pendingAppsCount = applications.filter(
    (a) => (a.status || "Pending") === "Pending"
  ).length;
  const approvedAppsCount = applications.filter((a) => a.status === "Approved").length;

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <AdminHeader
          title="Administrator Dashboard"
          subtitle={`Logged in as ${profile?.name || "Officer"} • Directorate of Welfare Operations`}
        />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Stat 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Schemes
              </span>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">
              {loading ? "..." : activeSchemesCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Out of {schemes.length} total cataloged
            </p>
          </div>

          {/* Stat 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Reviews
              </span>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black text-amber-700">
              {loading ? "..." : pendingAppsCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Awaiting officer verification
            </p>
          </div>

          {/* Stat 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Approved Grants
              </span>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black text-blue-700">
              {loading ? "..." : approvedAppsCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Benefits sanctioned to citizens
            </p>
          </div>

          {/* Stat 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Submissions
              </span>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900">
              {loading ? "..." : applications.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Digital applications logged
            </p>
          </div>
        </div>

        {/* Administrative Navigation Stations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Station 1 */}
          <Link
            href="/admin/schemes"
            className="group rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-emerald-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Schemes Directory
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Review, edit, activate/deactivate, and configure eligibility rules for central and state welfare programs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              Manage schemes catalog <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Station 2 */}
          <Link
            href="/admin/applications"
            className="group rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-blue-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
                Applications Queue
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Inspect applicant dossiers, verify certifications, approve benefits, or supply structured rejection reasons.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform">
              Review applications <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Station 3 */}
          <Link
            href="/admin/schemes/add"
            className="group rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-amber-300 flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition">
                Add New Scheme
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Publish a new government welfare directive with benefits breakdown, document checklists, and application guidelines.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-0.5 transition-transform">
              Launch scheme creation form <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>

        {/* Operational Guidance Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-white">Administrative Officer Directive</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                To guarantee high algorithmic accuracy for citizen matching, ensure each scheme includes explicit age brackets, income caps, and demographic parameters when configuring eligibility rules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}