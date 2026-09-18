"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getSchemeById } from "@/lib/schemes";
import { createApplication, hasUserApplied } from "@/lib/applications";
import {
  ArrowLeft,
  Building2,
  Landmark,
  CheckCircle2,
  FileCheck2,
  Send,
  Loader2,
  AlertCircle,
  Phone,
  MapPin,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params?.id;

  const { user, profile, loading: authLoading } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    reason: "",
    documentsAcknowledged: false,
  });

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }
      if (!schemeId) {
        setError("Scheme identifier is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const schemeData = await getSchemeById(schemeId);
        if (!schemeData) {
          setError("Scheme could not be found.");
          return;
        }

        setScheme(schemeData);

        const exists = await hasUserApplied(user.uid, schemeId);
        setAlreadyApplied(exists);

        // Prefill contact info
        const phone = profile?.profile?.phone || "";
        const state = profile?.profile?.state || "";
        const district = profile?.profile?.district || "";
        const defaultAddress = state && district ? `${district}, ${state}` : "";

        setFormData((prev) => ({
          ...prev,
          phone: prev.phone || phone,
          address: prev.address || defaultAddress,
        }));
      } catch (err) {
        console.error("Error loading application data:", err);
        setError("Unable to load application form.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user, schemeId, profile]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user || !scheme) return;
    if (alreadyApplied) {
      setError("You have already submitted an application for this scheme.");
      return;
    }

    if (!formData.phone.trim() || !formData.address.trim()) {
      setError("Please fill in all mandatory contact information.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createApplication({
        userId: user.uid,
        userName: profile?.name || profile?.displayName || user.displayName || "Citizen",
        userEmail: profile?.email || user.email || "",
        schemeId: scheme.id,
        schemeName: scheme.name,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        reason: formData.reason.trim(),
        profile: profile?.profile || {},
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Unable to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Preparing application form...
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href={`/schemes/${schemeId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Scheme Overview
          </Link>
        </div>

        {/* State 1: Submitted Success */}
        {submitted && scheme && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-14 text-center shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Submission Confirmed
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Application Successfully Submitted!
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Your application for <strong>{scheme.name}</strong> has been logged. Our administrative team will review your credentials against government criteria.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">{profile?.name || user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheme:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{scheme.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Status:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pending Review</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/applications")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                View My Applications
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/schemes")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse More Schemes
              </button>
            </div>
          </div>
        )}

        {/* State 2: Already Applied */}
        {!submitted && alreadyApplied && scheme && (
          <div className="rounded-3xl border border-blue-200 bg-white p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                You Have Already Applied
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                An application for <strong>{scheme.name}</strong> was previously recorded from your account. Duplicate applications are prohibited to protect review priority.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/applications"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                Check Application Status
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Active Application Form */}
        {!submitted && !alreadyApplied && scheme && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Direct Citizen Application
                  </span>
                  <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">
                    Apply for {scheme.name}
                  </h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Review your prefilled citizen credentials and provide mandatory submission details.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Prefilled Profile Details Notice */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Verified Citizen Dossier Attached
                    </div>
                    <p>
                      Your verified profile data (State: {profile?.profile?.state || "N/A"}, Income: ₹{profile?.profile?.annualIncome || "N/A"}, Category: {profile?.profile?.category || "N/A"}) will be securely forwarded to the reviewing officer.
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Phone Number *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs font-semibold">
                        +91
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        required
                        className="block w-full rounded-xl border border-slate-200 pl-12 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Residential Address *
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Door No., Street, Village/Ward, Tehsil/Block, District, State, Pincode"
                      required
                      className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  {/* Reason for Applying */}
                  <div>
                    <label htmlFor="reason" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Purpose / Justification for Aid (Optional)
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows={3}
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Briefly state your purpose or why your household qualifies for this welfare initiative..."
                      className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="pt-2">
                    <label className="relative flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        name="documentsAcknowledged"
                        checked={formData.documentsAcknowledged}
                        onChange={handleChange}
                        required
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                      />
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-900 block">
                          I declare that all submitted information is authentic
                        </span>
                        I have reviewed the mandatory document checklist and understand that submission of fraudulent documentation is punishable under national guidelines.
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <Link
                      href={`/schemes/${schemeId}`}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 transition"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Scheme Summary Sidebar (1 Col) */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Application Summary</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Scheme</span>
                    <span className="font-bold text-slate-900 text-sm">{scheme.name}</span>
                  </div>

                  {scheme.department && (
                    <div>
                      <span className="text-slate-400 block font-medium">Department</span>
                      <span className="font-semibold text-slate-700">{scheme.department}</span>
                    </div>
                  )}

                  {scheme.level && (
                    <div>
                      <span className="text-slate-400 block font-medium">Level</span>
                      <span className="font-semibold text-slate-700">{scheme.level}</span>
                    </div>
                  )}
                </div>

                {/* Required Documents checklist preview */}
                {scheme.documentsRequired && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-900 mb-2">Required Paperwork:</p>
                    {Array.isArray(scheme.documentsRequired) ? (
                      <ul className="space-y-1 text-xs text-slate-600">
                        {scheme.documentsRequired.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <FileCheck2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-600">{scheme.documentsRequired}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}