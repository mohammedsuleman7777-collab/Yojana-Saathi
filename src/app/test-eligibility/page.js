"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/auth";
import { checkAllSchemes } from "@/lib/eligibility";
import { getActiveSchemes } from "@/lib/schemes";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react";

export default function TestEligibilityPage() {
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setError("You are not currently logged in.");
          setLoading(false);
          return;
        }
        const userProfile = await getUserProfile(user.uid);

        if (!userProfile) {
          setError("User profile record not found.");
          setLoading(false);
          return;
        }
        setProfile(userProfile.profile);

        const schemes = await getActiveSchemes();
        const eligibilityResults = checkAllSchemes(userProfile.profile, schemes);

        setResults(eligibilityResults);
        setLoading(false);
      } catch (err) {
        console.error("Error checking eligibility:", err);
        setError("Something went wrong while evaluating eligibility.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          Running eligibility diagnostics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs sm:text-sm text-rose-800">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
          <p>{error}</p>
          <div className="mt-4">
            <Link href="/login" className="font-bold text-rose-900 underline">
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
          Diagnostic Tool
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Diagnostic Eligibility Match
        </h1>
        <p className="text-xs text-slate-500">
          Direct engine test verifying matched criteria against raw Firebase documents.
        </p>

        {profile && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 text-slate-700">
            <p className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-600" />
              Active Profile Evaluated:
            </p>
            <p>State: <strong>{profile.state || "N/A"}</strong></p>
            <p>Gender: <strong>{profile.gender || "N/A"}</strong></p>
            <p>Annual Income: <strong>₹{profile.annualIncome ?? "N/A"}</strong></p>
            <p>Category: <strong>{profile.category || "N/A"}</strong></p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Evaluated Schemes ({results.length})</h2>

        {results.length === 0 ? (
          <p className="text-xs text-slate-500">No active schemes cataloged in database.</p>
        ) : (
          results.map((scheme) => (
            <div
              key={scheme.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">{scheme.name}</h3>
                {scheme.eligible ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Eligible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <XCircle className="h-3.5 w-3.5" />
                    Not Eligible
                  </span>
                )}
              </div>

              {!scheme.eligible && scheme.reasons && scheme.reasons.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-600">Failed Criteria:</p>
                  <ul className="mt-1 list-disc list-inside text-xs text-rose-700 space-y-0.5">
                    {scheme.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}