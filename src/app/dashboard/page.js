"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getUserApplications } from "@/lib/applications";
import { isProfileComplete } from "@/lib/profile";
import {
  Sparkles,
  Bookmark,
  FileText,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile, logout } = useAuth();
  const [applicationCount, setApplicationCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const eligibilityProfile = profile?.profile || {};
  const savedSchemes = profile?.savedSchemes || [];
  const profileIsComplete = isProfileComplete(eligibilityProfile);

  // Calculate profile completion percentage
  const fieldsToCheck = [
    "dateOfBirth", "gender", "state", "district",
    "annualIncome", "occupation", "employmentStatus",
    "category", "maritalStatus", "educationLevel", "residenceType"
  ];
  const filledCount = fieldsToCheck.filter(f => eligibilityProfile[f] !== undefined && eligibilityProfile[f] !== null && eligibilityProfile[f] !== "").length;
  const completionPercentage = Math.round((filledCount / fieldsToCheck.length) * 100);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.uid) {
        setLoadingStats(false);
        return;
      }
      try {
        const applications = await getUserApplications(user.uid);
        setApplicationCount(applications.length);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoadingStats(false);
      }
    }
    loadDashboardData();
  }, [user]);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900 p-6 sm:p-10 text-white shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/60 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {profile?.role === "admin" ? "Administrator Account" : "Citizen Portal"}
                </span>
                {profileIsComplete && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-200 border border-emerald-400/20">
                    <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                    Profile Complete
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Welcome, {profile?.name || user?.displayName || "Citizen"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-emerald-100">
                {user?.email} • Track your government benefits and eligibility status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-300 transition"
              >
                <Sparkles className="h-4 w-4" />
                Find Schemes
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 backdrop-blur transition"
              >
                <User className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Completion Callout (if incomplete) */}
        {!profileIsComplete && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  Complete Your Profile for 100% Accurate Scheme Matching
                </div>
                <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed">
                  Your profile is {completionPercentage}% complete. Schemes evaluate specific criteria such as annual income, residence type, and occupation.
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-amber-700 shadow-sm transition shrink-0"
              >
                Complete Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Saved Schemes */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Bookmark className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Bookmarks
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">
                {savedSchemes.length}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                Saved Welfare Schemes
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/saved-schemes"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                View saved schemes
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Submitted Applications */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Applications
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">
                {loadingStats ? "..." : applicationCount}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                Applications Submitted
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/applications"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition"
              >
                Track status & history
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Eligibility Matcher */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matcher
              </span>
            </div>
            <div className="mt-4">
              <p className="text-lg font-bold text-slate-900">Scheme Matcher</p>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">
                Evaluate your eligibility against all active state and central welfare directives.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                Run eligibility check
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">
            Citizen Services & Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/schemes"
              className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-emerald-50/50 hover:border-emerald-200 group"
            >
              <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  Browse Catalog
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Search 500+ government programs
                </p>
              </div>
            </Link>

            <Link
              href="/eligibility"
              className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-amber-50/50 hover:border-amber-200 group"
            >
              <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
                  Eligibility Engine
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Instant criteria validation
                </p>
              </div>
            </Link>

            <Link
              href="/applications"
              className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-blue-50/50 hover:border-blue-200 group"
            >
              <div className="rounded-lg bg-blue-100 p-2.5 text-blue-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                  Applications
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  View submitted applications
                </p>
              </div>
            </Link>

            <Link
              href="/profile"
              className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-purple-50/50 hover:border-purple-200 group"
            >
              <div className="rounded-lg bg-purple-100 p-2.5 text-purple-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
                  Citizen Profile
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Update income, caste, state
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}