"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getUserEligibilityProfile, updateUserProfile } from "@/lib/auth";
import {
  User,
  MapPin,
  IndianRupee,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

const initialProfile = {
  dateOfBirth: "",
  gender: "",
  state: "",
  district: "",
  annualIncome: "",
  occupation: "",
  employmentStatus: "",
  category: "",
  disabilityStatus: false,
  maritalStatus: "",
  educationLevel: "",
  residenceType: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile: userProfile, refreshProfile } = useAuth();

  const [formData, setFormData] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const eligibilityProfile = await getUserEligibilityProfile(user.uid);
        if (eligibilityProfile) {
          setFormData({ ...initialProfile, ...eligibilityProfile });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Unable to load your profile. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Calculate completeness
  const fields = Object.keys(initialProfile);
  const completedFields = fields.filter((f) => {
    const val = formData[f];
    return val !== "" && val !== null && val !== undefined;
  }).length;
  const progressPercent = Math.round((completedFields / fields.length) * 100);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateUserProfile(user.uid, {
        ...formData,
        annualIncome: Number(formData.annualIncome) || 0,
      });
      setMessage("Profile saved successfully!");
      await refreshProfile(user.uid);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 800);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Unable to save your profile. Please check your network and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading profile...
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header with Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Citizen Eligibility Profile
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Government schemes use these demographic parameters to evaluate your eligibility.
            </p>
          </div>

          <Link
            href="/eligibility"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            Check Eligibility
          </Link>
        </div>

        {/* Completion Progress Bar Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>Profile Completeness</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                {progressPercent}% Complete
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {completedFields} of {fields.length} attributes filled
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Info Pill */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-900">Registered Citizen: </span>
            {userProfile?.name || user?.displayName || "N/A"} ({userProfile?.email || user?.email})
          </div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
            {userProfile?.role || "Citizen"}
          </span>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Personal Demographics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                1. Personal Demographics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label htmlFor="maritalStatus" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Marital Status *
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select marital status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Location & Residence */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                2. Location & Residence
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* State */}
              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  State / UT *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra, Karnataka, Uttar Pradesh"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* District */}
              <div>
                <label htmlFor="district" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  District *
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Pune, Bengaluru Urban, Lucknow"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Residence Type */}
              <div>
                <label htmlFor="residenceType" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Residence Type *
                </label>
                <select
                  id="residenceType"
                  name="residenceType"
                  value={formData.residenceType}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select residence type</option>
                  <option value="Rural">Rural</option>
                  <option value="Urban">Urban</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Economic Background */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <IndianRupee className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                3. Economic Background
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Annual Income */}
              <div>
                <label htmlFor="annualIncome" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Annual Household Income (₹) *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    ₹
                  </div>
                  <input
                    id="annualIncome"
                    name="annualIncome"
                    type="number"
                    min="0"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    placeholder="250000"
                    required
                    className="block w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              {/* Occupation */}
              <div>
                <label htmlFor="occupation" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Occupation *
                </label>
                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Farmer, Teacher, Electrician, Student"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Employment Status */}
              <div>
                <label htmlFor="employmentStatus" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Employment Status *
                </label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select employment status</option>
                  <option value="Employed">Employed (Salaried)</option>
                  <option value="Self-employed">Self-employed / Business</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 4: Social & Education */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                4. Social & Education
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Social Category / Caste *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Castes)</option>
                  <option value="ST">ST (Scheduled Tribes)</option>
                  <option value="EWS">EWS (Economically Weaker Sections)</option>
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label htmlFor="educationLevel" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Highest Education Level *
                </label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select education level</option>
                  <option value="No formal education">No formal education</option>
                  <option value="Primary">Primary (Class 1-5)</option>
                  <option value="Secondary">Secondary (Class 6-10)</option>
                  <option value="Higher Secondary">Higher Secondary (Class 11-12)</option>
                  <option value="Diploma">Diploma / Vocational</option>
                  <option value="Graduate">Graduate (Bachelor's)</option>
                  <option value="Postgraduate">Postgraduate (Master's)</option>
                  <option value="Doctorate">Doctorate (Ph.D.)</option>
                </select>
              </div>

              {/* Disability Status */}
              <div className="sm:col-span-2 pt-2">
                <label className="relative flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    name="disabilityStatus"
                    checked={formData.disabilityStatus}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      Person with Benchmark Disability (PwD)
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check this box if you possess a government Disability Certificate (40%+ benchmark disability) to match with specialized welfare reservations.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile & Continue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}