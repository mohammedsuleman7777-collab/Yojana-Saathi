"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getActiveSchemes } from "@/lib/schemes";
import { updateSavedSchemes } from "@/lib/auth";
import SchemeCard from "@/components/SchemeCard";
import {
  Search,
  Filter,
  Landmark,
  RotateCcw,
  Sparkles,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

function SchemesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const { user, profile } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("nameAsc");

  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoading(true);
        const data = await getActiveSchemes();
        setSchemes(data);
      } catch (err) {
        console.error("Error loading schemes:", err);
        setError("Unable to load schemes catalog. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  const departments = [
    ...new Set(schemes.map((s) => s.department).filter(Boolean)),
  ].sort();

  const levels = [
    ...new Set(schemes.map((s) => s.level).filter(Boolean)),
  ].sort();

  const categories = [
    ...new Set(
      schemes.flatMap((s) =>
        Array.isArray(s.category) ? s.category : [s.category]
      ).filter(Boolean)
    ),
  ].sort();

  const filteredSchemes = schemes.filter((scheme) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      !search ||
      scheme.name?.toLowerCase().includes(search) ||
      scheme.description?.toLowerCase().includes(search) ||
      scheme.shortDescription?.toLowerCase().includes(search) ||
      scheme.department?.toLowerCase().includes(search) ||
      (Array.isArray(scheme.category)
        ? scheme.category.some((c) => c?.toLowerCase().includes(search))
        : scheme.category?.toLowerCase().includes(search));

    const matchesDepartment = !department || scheme.department === department;
    const matchesLevel = !level || scheme.level === level;
    const matchesCategory =
      !category ||
      (Array.isArray(scheme.category)
        ? scheme.category.includes(category)
        : scheme.category === category);

    return matchesSearch && matchesDepartment && matchesLevel && matchesCategory;
  });

  const sortedSchemes = [...filteredSchemes].sort((a, b) => {
    if (sortBy === "nameAsc") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "nameDesc") return (b.name || "").localeCompare(a.name || "");
    if (sortBy === "department") return (a.department || "").localeCompare(b.department || "");
    return 0;
  });

  function clearFilters() {
    setSearchTerm("");
    setDepartment("");
    setLevel("");
    setCategory("");
    setSortBy("nameAsc");
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/40 px-3 py-1 text-xs font-bold text-emerald-800 mb-2">
            <Landmark className="h-3.5 w-3.5 text-emerald-700" />
            Central & State Welfare Directory
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Government Schemes Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Browse verified welfare schemes, subsidies, educational grants, and citizen benefits.
          </p>
        </div>

        <Link
          href="/eligibility"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition shrink-0 self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          Check Personalized Match
        </Link>
      </div>

      {/* Filter Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            Filter Schemes
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
              placeholder="Search by name or keyword..."
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
            <option value="">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{sortedSchemes.length}</strong> of {schemes.length} active programs
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
          >
            <option value="nameAsc">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
            <option value="department">Department</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : sortedSchemes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Landmark className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No schemes found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            No active welfare programs match your current search terms or selected filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              isSaved={savedList.includes(scheme.id)}
              onToggleSave={handleToggleSave}
              saving={savingId === scheme.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading catalog...
          </div>
        </div>
      }
    >
      <SchemesContent />
    </Suspense>
  );
}
