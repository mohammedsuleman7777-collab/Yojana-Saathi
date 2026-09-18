"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { addScheme } from "@/lib/schemes";
import AdminHeader from "@/components/AdminHeader";
import {
  Layers,
  Building2,
  FileCheck2,
  Send,
  Save,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const initialFormData = {
  name: "",
  shortDescription: "",
  description: "",
  department: "",
  level: "Central",
  category: "",
  benefits: "",
  documentsRequired: "",
  applicationProcess: "",
  applicationUrl: "",
  state: "All India",
};

export default function AddSchemePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in as an administrator.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addScheme(
        {
          ...formData,
          benefits: formData.benefits
            .split("\n")
            .map((i) => i.trim())
            .filter(Boolean),
          documentsRequired: formData.documentsRequired
            .split("\n")
            .map((i) => i.trim())
            .filter(Boolean),
        },
        user.uid
      );
      router.replace("/admin/schemes");
    } catch (err) {
      console.error("Error adding scheme:", err);
      setError("Unable to publish scheme. Please check all fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <AdminHeader
          title="Publish New Government Scheme"
          subtitle="Add a new welfare program or subsidy to the citizen catalog."
        />

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Basic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-base font-bold text-slate-900">Basic Scheme Information</h2>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Scheme Title *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)"
                required
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Summary (1-2 lines) *
              </label>
              <input
                id="shortDescription"
                name="shortDescription"
                type="text"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief one-sentence summary for scheme cards and catalog previews"
                required
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Description & Background *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed explanation of the policy, target beneficiaries, and overarching objectives..."
                required
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Card 2: Classification */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-base font-bold text-slate-900">Classification & Jurisdiction</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="department" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nodal Ministry / Department *
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Ministry of Agriculture & Farmers Welfare"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="level" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jurisdiction Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Central">Central Government</option>
                  <option value="State">State Government</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Tag *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Agriculture, Healthcare, Education, Housing"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Applicable State / UT *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. All India, Maharashtra, Karnataka"
                  required
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Benefits & Documents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-base font-bold text-slate-900">Benefits & Required Documentation</h2>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="benefits" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Benefits & Entitlements *
                </label>
                <span className="text-[11px] text-slate-400">One benefit per line</span>
              </div>
              <textarea
                id="benefits"
                name="benefits"
                rows={4}
                value={formData.benefits}
                onChange={handleChange}
                placeholder={"₹6,000 per year direct transfer\nDisbursed in 3 equal installments\nDirect bank transfer without commission"}
                required
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="documentsRequired" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Required Documents Checklist *
                </label>
                <span className="text-[11px] text-slate-400">One document per line</span>
              </div>
              <textarea
                id="documentsRequired"
                name="documentsRequired"
                rows={4}
                value={formData.documentsRequired}
                onChange={handleChange}
                placeholder={"Aadhaar Card\nLand Ownership Record (Khata/Khatoni)\nActive Bank Passbook Copy"}
                required
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Card 4: Application Procedure */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-base font-bold text-slate-900">Application Guidelines & Portal</h2>
            </div>

            <div>
              <label htmlFor="applicationProcess" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Step-by-Step Application Process *
              </label>
              <textarea
                id="applicationProcess"
                name="applicationProcess"
                rows={4}
                value={formData.applicationProcess}
                onChange={handleChange}
                placeholder="Explain how citizens apply (online submission, CSC centers, village nodal officer)..."
                required
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label htmlFor="applicationUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Application URL (Optional)
              </label>
              <input
                id="applicationUrl"
                name="applicationUrl"
                type="url"
                value={formData.applicationUrl}
                onChange={handleChange}
                placeholder="https://pmkisan.gov.in"
                className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
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
                  Publishing Scheme...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Publish Scheme
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}