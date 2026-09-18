"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getActiveSchemes } from "@/lib/schemes";
import { checkAllSchemes } from "@/lib/eligibility";
import { isProfileComplete } from "@/lib/profile";
import { updateSavedSchemes } from "@/lib/auth";
import SchemeCard from "@/components/SchemeCard";
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  User,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react";

export default function EligibilityPage() {
  const { user, profile } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("eligible"); // 'eligible' or 'other'
  const [savingId, setSavingId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("relevant");

  useEffect(() => {
    async function loadEligibility() {
      const eligibilityProfile = profile?.profile;

      if (!eligibilityProfile) {
        setLoading(false);
        setError("Your profile information could not be found.");
        return;
      }

      if (!isProfileComplete(eligibilityProfile)) {
        setLoading(false);
        setError("Please complete your citizen profile before checking eligibility.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const schemes = await getActiveSchemes();
        const eligibilityResults = checkAllSchemes(eligibilityProfile, schemes);
        setResults(eligibilityResults);
      } catch (err) {
        console.error("Error evaluating eligibility:", err);
        setError("Unable to calculate scheme eligibility. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      loadEligibility();
    }
  }, [profile]);

  const departments = [
    ...new Set(results.map((scheme) => scheme.department).filter(Boolean)),
  ].sort();

  const levels = [
    ...new Set(results.map((scheme) => scheme.level).filter(Boolean)),
  ].sort();

  const categories = [
    ...new Set(
      results.flatMap((scheme) =>
        Array.isArray(scheme.category) ? scheme.category : [scheme.category]
      ).filter(Boolean)
    ),
  ].sort();

  const filteredResults = results.filter((scheme) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      !search ||
      scheme.name?.toLowerCase().includes(search) ||
      scheme.description?.toLowerCase().includes(search) ||
      scheme.shortDescription?.toLowerCase().includes(search) ||
      scheme.department?.toLowerCase().includes(search) ||
      (Array.isArray(scheme.category)
        ? scheme.category.some((c) => c?.toLowerCase().includes(search))
        : scheme.category?.toLowerCase().includes(search)) ||
      scheme.level?.toLowerCase().includes(search);

    const matchesDepartment = !department || scheme.department === department;
    const matchesLevel = !level || scheme.level === level;
    const matchesCategory =
      !category ||
      (Array.isArray(scheme.category)
        ? scheme.category.includes(category)
        : scheme.category === category);

    return matchesSearch && matchesDepartment && matchesLevel && matchesCategory;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "nameAsc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "nameDesc") return (b.name || "").localeCompare(a.name || "");
    if (sortBy === "department") return (a.department || "").localeCompare(b.department || "");
    if (sortBy === "category") return (String(a.category) || "").localeCompare(String(b.category) || "");
    return 0;
  });

  const eligibleSchemes = sortedResults.filter((scheme) => scheme.eligible);
  const notEligibleSchemes = sortedResults.filter((scheme) => !scheme.eligible);

  function clearFilters() {
    setSearchTerm("");
    setDepartment("");
    setLevel("");
    setCategory("");
    setSortBy("relevant");
  }

  async function handleToggleSave(scheme) {
    if (!user || savingId) return;
    try {
      setSavingId(scheme.id);
      const currentSaved = profile?.savedSchemes || [];
      const updated = currentSaved.includes(scheme.id)
        ? currentSaved.filter((id) => id !== scheme.id)
        : [...currentSaved, scheme.id];

      await updateSavedSchemes(user.uid, updated);
      if (profile) {
        profile.savedSchemes = updated;
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    } finally {
      setSavingId(null);
    }
  }

  const savedList = profile?.savedSchemes || [];

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/40 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Algorithmic Eligibility Matcher
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Government Scheme Eligibility
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Personalized matching against your demographic, financial, and residence profile.
            </p>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm self-start md:self-auto"
          >
            <User className="h-4 w-4 text-emerald-600" />
            Update Profile Data
          </Link>
        </div>

        {/* Profile Snapshot Strip */}
        {profile?.profile && isProfileComplete(profile.profile) && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Profile Evaluated:
                </span>
                <span>{profile.profile.gender || "N/A"}</span>
                <span>•</span>
                <span>{profile.profile.state}, {profile.profile.district}</span>
                <span>•</span>
                <span>₹{Number(profile.profile.annualIncome).toLocaleString("en-IN")}/year</span>
                <span>•</span>
                <span className="font-medium bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                  {profile.profile.category}
                </span>
                <span>•</span>
                <span>{profile.profile.occupation}</span>
              </div>
              <Link
                href="/profile"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0"
              >
                Edit
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <h2 className="text-base font-bold text-slate-900">Evaluating Scheme Eligibility...</h2>
            <p className="text-xs text-slate-500 mt-1">Comparing your profile against active welfare criteria.</p>
          </div>
        )}

        {/* Error / Incomplete Profile State */}
        {!loading && error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
            <h2 className="text-xl font-bold text-amber-950">Action Required to Check Eligibility</h2>
            <p className="mt-2 text-sm text-amber-800 leading-relaxed">{error}</p>
            <div className="mt-6">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-700 transition"
              >
                Complete Citizen Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Filter Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  Search & Filter Directives
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 self-start sm:self-auto"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search schemes..."
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Department */}
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">All Departments</option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>

                {/* Level */}
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">All Levels (Central/State)</option>
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="nameAsc">Name (A-Z)</option>
                  <option value="nameDesc">Name (Z-A)</option>
                  <option value="department">Department</option>
                  <option value="category">Category</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Showing <strong>{sortedResults.length}</strong> of {results.length} active programs
                </span>
              </div>
            </div>

            {/* Results Tabs */}
            <div className="flex border-b border-slate-200 gap-4 sm:gap-8">
              <button
                type="button"
                onClick={() => setActiveTab("eligible")}
                className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition border-b-2 ${
                  activeTab === "eligible"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Eligible Schemes</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === "eligible"
                      ? "bg-emerald-100 text-emerald-800 font-extrabold"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {eligibleSchemes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("other")}
                className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition border-b-2 ${
                  activeTab === "other"
                    ? "border-amber-600 text-amber-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <XCircle className="h-4 w-4" />
                <span>Other Schemes</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === "other"
                      ? "bg-amber-100 text-amber-800 font-extrabold"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {notEligibleSchemes.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Eligible Schemes */}
            {activeTab === "eligible" && (
              <div>
                {eligibleSchemes.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No eligible schemes matched</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                      Try clearing your search query or department filters to see all qualifying welfare initiatives.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eligibleSchemes.map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        isSaved={savedList.includes(scheme.id)}
                        onToggleSave={handleToggleSave}
                        saving={savingId === scheme.id}
                        showEligibility={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Other Schemes */}
            {activeTab === "other" && (
              <div>
                {notEligibleSchemes.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
                    <h3 className="text-base font-bold text-slate-800">Great news!</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      You meet the eligibility criteria for all active schemes matching your filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notEligibleSchemes.map((scheme) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        isSaved={savedList.includes(scheme.id)}
                        onToggleSave={handleToggleSave}
                        saving={savingId === scheme.id}
                        showEligibility={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
