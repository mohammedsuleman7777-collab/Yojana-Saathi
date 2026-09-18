"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getActiveSchemes } from "@/lib/schemes";
import SchemeCard from "@/components/SchemeCard";
import {
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Users2,
  Landmark,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const schemes = await getActiveSchemes();
        setFeaturedSchemes(schemes.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured schemes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/schemes");
    }
  }

  const categoryPills = [
    { label: "Agriculture & Farmers", query: "Agriculture" },
    { label: "Education & Scholarships", query: "Education" },
    { label: "Healthcare & Insurance", query: "Health" },
    { label: "Women & Child", query: "Women" },
    { label: "Housing & Rural", query: "Housing" },
    { label: "Business & MSME", query: "Business" },
  ];

  const faqs = [
    {
      question: "Is Yojana Sathi completely free for Indian citizens?",
      answer: "Yes, 100% free. Yojana Sathi never charges any fee to check scheme eligibility, search government programs, or submit applications on this platform.",
    },
    {
      question: "How does the eligibility matcher work?",
      answer: "When you update your citizen profile (specifying age, gender, state, district, annual income, category, and occupation), our rules engine instantly compares your data against the gazetted eligibility conditions of every active Central and State scheme.",
    },
    {
      question: "What documents are commonly required for applications?",
      answer: "While each scheme specifies its requirements, the most frequent documents include Aadhaar Card, Income Certificate, Caste/Category Certificate, Residential Proof, Bank Passbook, and Educational Marksheets.",
    },
    {
      question: "Can I track my submitted applications?",
      answer: "Yes! Navigate to 'My Applications' to inspect real-time review updates (Pending, Under Review, Approved, or Rejected) with official administrator remarks.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/60 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            National Citizen Welfare & Eligibility Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Find Every Government Scheme{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-amber-400">
              You Are Eligible For
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Personalized algorithmic matching across Central and State government welfare programs, subsidies, educational grants, and direct financial transfers.
          </p>

          {/* Prominent Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 mx-auto max-w-2xl flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scheme name, department, or keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold shadow-lg transition-all"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Category Filters */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto text-xs">
            <span className="text-emerald-200/80 mr-1 font-medium">Popular:</span>
            {categoryPills.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={() => router.push(`/schemes?category=${encodeURIComponent(pill.query)}`)}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 text-emerald-100 hover:text-white transition"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/eligibility"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition"
            >
              <Sparkles className="h-4 w-4" />
              Check Eligibility Match
            </Link>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/25 border border-white/20 backdrop-blur-md transition"
            >
              Browse All Schemes
            </Link>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-emerald-700">500+</p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">Central & State Schemes</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-slate-900">₹0 Fee</p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">100% Free for Citizens</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-emerald-700">Instant</p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">Rule-Based Eligibility</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-extrabold text-slate-900">28 States</p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">& 8 Union Territories</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              Seamless 3-Step Process
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Yojana Sathi Connects You to Benefits
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Skip hours of searching through gazettes. Get exact government programs designed for your demographic.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative rounded-2xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col items-start">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Complete Citizen Profile</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Provide your basic profile: date of birth, state, district, income bracket, occupation, caste category, and education level.
              </p>
              <Link
                href={user ? "/profile" : "/register"}
                className="mt-6 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                Set up profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col items-start">
              <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automated Eligibility Check</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Our eligibility engine tests every scheme condition. If you don't qualify for a scheme, it explicitly shows why with actionable steps.
              </p>
              <Link
                href="/eligibility"
                className="mt-6 text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
              >
                Check your eligibility <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col items-start">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Apply & Track Real-Time</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Submit digital applications directly with prefilled credentials or access official government portals, then monitor approval status live.
              </p>
              <Link
                href="/applications"
                className="mt-6 text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                Track applications <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SCHEMES SHOWCASE */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                Welfare Catalog
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured Government Initiatives
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Explore currently active welfare programs receiving citizen applications.
              </p>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              Explore all schemes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : featuredSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
              <Landmark className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-base font-semibold text-slate-700">No schemes currently featured</p>
              <p className="text-xs text-slate-500 mt-1">Check back shortly as new government programs are cataloged.</p>
            </div>
          )}
        </div>
      </section>

      {/* WHY YOJANA SATHI / VALUE PROP */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950 border border-amber-800 px-3 py-1 rounded-full">
                Direct Citizen Impact
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
                Designed to eliminate middlemen and misinformation.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Millions of eligible citizens miss out on life-changing welfare schemes due to complex guidelines, fragmented portals, and lack of awareness. Yojana Sathi centralizes data so every Indian can claim their rightful entitlements.
              </p>

              <div className="mt-8 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Direct & Transparent</p>
                    <p className="text-xs text-slate-400">Zero commission, zero fees, directly linked to official government directives.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Explicit Rejection Clarity</p>
                    <p className="text-xs text-slate-400">If you are ineligible, we tell you exactly which rule failed (e.g., income limit, residence, age).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Document Checklist Provided</p>
                    <p className="text-xs text-slate-400">Know exactly what paperwork to prepare before submitting applications.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-8 backdrop-blur">
              <h3 className="text-lg font-bold text-white mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-800/40"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left p-4 flex items-center justify-between gap-3 text-sm font-semibold text-white hover:text-emerald-400 transition"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isOpen ? "rotate-180 text-emerald-400" : "text-slate-400"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-700/40">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-tr from-emerald-800 to-emerald-700 text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Check Your Entitlements Today
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto">
            Take 2 minutes to create your citizen profile and discover all welfare benefits waiting for your household.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-amber-400 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-xl hover:bg-amber-300 transition"
            >
              Get Started for Free
            </Link>
            <Link
              href="/eligibility"
              className="rounded-xl bg-white/15 border border-white/30 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/25 backdrop-blur transition"
            >
              Test Eligibility Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}