"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AdminHeader from "@/components/AdminHeader";
import { getScheme, updateSchemeEligibility } from "@/lib/schemes";
import {
  Sliders,
  Save,
  ArrowLeft,
  AlertCircle,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Users,
  ShieldCheck,
} from "lucide-react";

const initialEligibility = {
  age: {
    min: "",
    max: "",
  },
  annualIncome: {
    min: "",
    max: "",
  },
  gender: [],
  state: [],
  district: [],
  category: [],
  occupation: [],
  employmentStatus: [],
  disabilityStatus: null,
  maritalStatus: [],
  educationLevel: [],
  residenceType: [],
};

export default function SchemeEligibilityConfigPage() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params?.id;

  const [scheme, setScheme] = useState(null);
  const [eligibility, setEligibility] = useState(initialEligibility);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScheme() {
      if (!schemeId) return;

      try {
        setLoading(true);
        setError("");
        const schemeData = await getScheme(schemeId);

        if (!schemeData) {
          setError("Scheme not found.");
          return;
        }

        setScheme(schemeData);
        setEligibility({
          ...initialEligibility,
          ...(schemeData.eligibility || {}),
          age: {
            ...initialEligibility.age,
            ...(schemeData.eligibility?.age || {}),
          },
          annualIncome: {
            ...initialEligibility.annualIncome,
            ...(schemeData.eligibility?.annualIncome || {}),
          },
          gender: schemeData.eligibility?.gender || [],
          state: schemeData.eligibility?.state || [],
          district: schemeData.eligibility?.district || [],
          category: schemeData.eligibility?.category || [],
          occupation: schemeData.eligibility?.occupation || [],
          employmentStatus: schemeData.eligibility?.employmentStatus || [],
          maritalStatus: schemeData.eligibility?.maritalStatus || [],
          educationLevel: schemeData.eligibility?.educationLevel || [],
          residenceType: schemeData.eligibility?.residenceType || [],
        });
      } catch (err) {
        console.error("Error loading scheme:", err);
        setError("Unable to load scheme.");
      } finally {
        setLoading(false);
      }
    }

    loadScheme();
  }, [schemeId]);

  function handleRangeChange(e) {
    const { name, value } = e.target;
    const [field, type] = name.split(".");

    setEligibility((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: value,
      },
    }));
  }

  function handleArrayChange(e) {
    const { name, value } = e.target;
    setEligibility((prev) => ({
      ...prev,
      [name]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  }

  function handleDisabilityChange(e) {
    const value = e.target.value;
    let disabilityStatus = null;
    if (value === "true") disabilityStatus = true;
    if (value === "false") disabilityStatus = false;

    setEligibility((prev) => ({
      ...prev,
      disabilityStatus,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const cleanedEligibility = {
        ...eligibility,
        age: {
          min:
            eligibility.age.min === "" || eligibility.age.min === null
              ? null
              : Number(eligibility.age.min),
          max:
            eligibility.age.max === "" || eligibility.age.max === null
              ? null
              : Number(eligibility.age.max),
        },
        annualIncome: {
          min:
            eligibility.annualIncome.min === "" || eligibility.annualIncome.min === null
              ? null
              : Number(eligibility.annualIncome.min),
          max:
            eligibility.annualIncome.max === "" || eligibility.annualIncome.max === null
              ? null
              : Number(eligibility.annualIncome.max),
        },
      };

      await updateSchemeEligibility(schemeId, cleanedEligibility);
      router.replace("/admin/schemes");
    } catch (err) {
      console.error("Error saving eligibility criteria:", err);
      setError("Unable to save eligibility criteria. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading eligibility configurator...
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <AdminHeader
          title={`Configure Eligibility: ${scheme?.name || "Scheme"}`}
          subtitle="Configure the algorithmic rules evaluated when citizens check their eligibility."
        />

        {/* Info Banner */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">How Eligibility Evaluation Works:</p>
            <p className="text-blue-800 leading-relaxed">
              Any field left empty or unselected acts as an <strong>open condition</strong> (i.e. no citizen is disqualified by that criterion). Comma-separated fields allow multiple matching values (e.g. "Male, Female" or "General, OBC").
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Age & Financial Range */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-base font-bold text-slate-900">Age & Household Income Thresholds</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age Min */}
              <div>
                <label htmlFor="age.min" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Minimum Age (Years)
                </label>
                <input
                  id="age.min"
                  name="age.min"
                  type="number"
                  min="0"
                  max="120"
                  value={eligibility.age.min ?? ""}
                  onChange={handleRangeChange}
                  placeholder="e.g. 18 (leave empty for none)"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Age Max */}
              <div>
                <label htmlFor="age.max" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Maximum Age (Years)
                </label>
                <input
                  id="age.max"
                  name="age.max"
                  type="number"
                  min="0"
                  max="120"
                  value={eligibility.age.max ?? ""}
                  onChange={handleRangeChange}
                  placeholder="e.g. 60 (leave empty for none)"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Income Min */}
              <div>
                <label htmlFor="annualIncome.min" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Minimum Annual Income (₹)
                </label>
                <input
                  id="annualIncome.min"
                  name="annualIncome.min"
                  type="number"
                  min="0"
                  value={eligibility.annualIncome.min ?? ""}
                  onChange={handleRangeChange}
                  placeholder="Leave empty for none"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Income Max */}
              <div>
                <label htmlFor="annualIncome.max" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Maximum Annual Income (₹ Ceiling)
                </label>
                <input
                  id="annualIncome.max"
                  name="annualIncome.max"
                  type="number"
                  min="0"
                  value={eligibility.annualIncome.max ?? ""}
                  onChange={handleRangeChange}
                  placeholder="e.g. 250000 (leave empty for none)"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Demographic & Geographical Rules */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-base font-bold text-slate-900">Demographic & Geographic Matching</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="gender" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Eligible Genders
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="gender"
                  name="gender"
                  type="text"
                  value={eligibility.gender.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Female, Other (empty = all)"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Eligible Social Categories
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={eligibility.category.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. SC, ST, OBC, EWS"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="state" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Applicable States
                  </label>
                  <span className="text-[10px] text-slate-400">Empty for All-India</span>
                </div>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={eligibility.state.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Maharashtra, Gujarat"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="district" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Target Districts
                  </label>
                  <span className="text-[10px] text-slate-400">Empty for all districts</span>
                </div>
                <input
                  id="district"
                  name="district"
                  type="text"
                  value={eligibility.district.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Pune, Nagpur"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="residenceType" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Residence Type
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="residenceType"
                  name="residenceType"
                  type="text"
                  value={eligibility.residenceType.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Rural, Urban"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="disabilityStatus" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Benchmark Disability (PwD) Rule
                </label>
                <select
                  id="disabilityStatus"
                  value={
                    eligibility.disabilityStatus === null
                      ? ""
                      : String(eligibility.disabilityStatus)
                  }
                  onChange={handleDisabilityChange}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">No restriction (open to both)</option>
                  <option value="true">Must have Disability Certificate (PwD)</option>
                  <option value="false">Must NOT have Disability Certificate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Occupation & Education */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-base font-bold text-slate-900">Occupation, Education & Civil Status</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="occupation" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Eligible Occupations
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  value={eligibility.occupation.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Farmer, Student, Weaver"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="employmentStatus" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Employment Status
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="employmentStatus"
                  name="employmentStatus"
                  type="text"
                  value={eligibility.employmentStatus.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Unemployed, Self-employed"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="educationLevel" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Education Levels
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="educationLevel"
                  name="educationLevel"
                  type="text"
                  value={eligibility.educationLevel.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Higher Secondary, Graduate"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="maritalStatus" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Marital Status
                  </label>
                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                </div>
                <input
                  id="maritalStatus"
                  name="maritalStatus"
                  type="text"
                  value={eligibility.maritalStatus.join(", ")}
                  onChange={handleArrayChange}
                  placeholder="e.g. Married, Widowed"
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/schemes"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Criteria...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Eligibility Criteria
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}