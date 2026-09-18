"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AdminHeader from "@/components/AdminHeader";
import StatusBadge from "@/components/StatusBadge";
import {
  getApplicationById,
  updateApplicationStatus,
} from "@/lib/applications";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminApplicationDetailsPage() {
  const params = useParams();
  const applicationId = params?.id;

  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadApplication() {
      if (!applicationId) return;

      try {
        setLoading(true);
        setError("");

        const data = await getApplicationById(applicationId);
        if (!data) {
          setError("Application could not be located.");
          return;
        }

        setApplication(data);
        setStatus(data.status || "Pending");
        setRejectionReason(data.rejectionReason || "");
      } catch (err) {
        console.error("Error loading application:", err);
        setError("Unable to load application details.");
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId]);

  async function handleStatusUpdate() {
    if (status === "Rejected" && !rejectionReason.trim()) {
      setError("Please supply a mandatory rejection reason to inform the citizen.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateApplicationStatus(applicationId, status, rejectionReason);

      setApplication((curr) => ({
        ...curr,
        status,
        rejectionReason: status === "Rejected" ? rejectionReason.trim() : "",
      }));

      setSuccess("Application status and decision updated successfully.");
    } catch (err) {
      console.error("Error updating application status:", err);
      setError(err.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp?.seconds) return "Recently";
    return new Date(timestamp.seconds * 1000).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading application record...
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error && !application) {
    return (
      <AuthGuard allowedRoles={["admin"]}>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-600 mb-3" />
            <h1 className="text-xl font-bold text-rose-950">Record Unavailable</h1>
            <p className="mt-2 text-sm text-rose-800">{error}</p>
            <div className="mt-6">
              <Link
                href="/admin/applications"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Applications Queue
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const applicantProfile = application.profile || {};

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <AdminHeader
          title={`Review Application: ${application.schemeName || "Welfare Scheme"}`}
          subtitle={`Citizen: ${application.userName || "Unknown"} • Reference: ${applicationId}`}
        />

        {success && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Dossier Information (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scheme Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Welfare Scheme
                </span>
                {application.schemeId && (
                  <Link
                    href={`/admin/schemes/${application.schemeId}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    View Scheme Rules
                  </Link>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {application.schemeName}
              </h2>
              <span className="font-mono text-xs text-slate-400 block">
                Scheme ID: {application.schemeId}
              </span>
            </div>

            {/* Applicant Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Applicant Citizen Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block mb-1">Full Name</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-400" />
                    {application.userName || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Email Address</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {application.userEmail || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Phone Number</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    +91 {application.phone || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Date Submitted</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(application.createdAt)}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Residential Address</span>
                  <p className="font-semibold text-slate-900 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{application.address || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Profile Snapshot if available */}
              {Object.keys(applicantProfile).length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-2">Attached Demographic Snapshot:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div>State: <strong>{applicantProfile.state || "N/A"}</strong></div>
                    <div>District: <strong>{applicantProfile.district || "N/A"}</strong></div>
                    <div>Income: <strong>₹{applicantProfile.annualIncome ?? "N/A"}</strong></div>
                    <div>Category: <strong>{applicantProfile.category || "N/A"}</strong></div>
                    <div>Occupation: <strong>{applicantProfile.occupation || "N/A"}</strong></div>
                    <div>Gender: <strong>{applicantProfile.gender || "N/A"}</strong></div>
                  </div>
                </div>
              )}

              {application.reason && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 block mb-1">Statement of Need:</span>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                    {application.reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Decision Action Station (1 Col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Officer Decision Station</h3>
                <StatusBadge status={status} />
              </div>

              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Update Application Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved (Sanctioned)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {status === "Rejected" && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-2 animate-in fade-in-0 duration-150">
                  <label htmlFor="rejectionReason" className="block text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Rejection Reason *
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide explicit feedback to the citizen (e.g. Income certificate exceeds ceiling of ₹2.5L, Land records mismatch)..."
                    required
                    className="block w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <p className="text-[10px] text-rose-700">
                    This message will be displayed on the citizen's application tracker.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 transition"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording Decision...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Status Decision
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 text-center">
                Last updated on {formatDate(application.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}