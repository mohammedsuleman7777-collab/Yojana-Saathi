"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getApplicationById } from "@/lib/applications";
import StatusBadge from "@/components/StatusBadge";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const applicationId = params?.id;

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplication() {
      if (!applicationId || !user?.uid) return;

      try {
        setLoading(true);
        setError("");

        const data = await getApplicationById(applicationId);

        if (!data) {
          setError("Application record could not be found.");
          return;
        }

        // Authorization protection
        if (data.userId !== user.uid) {
          setError("You do not have authorization to view this application.");
          return;
        }

        setApplication(data);
      } catch (err) {
        console.error("Error loading application:", err);
        setError("Unable to load application details.");
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId, user]);

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
      <AuthGuard>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            Loading application history...
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !application) {
    return (
      <AuthGuard>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-600 mb-3" />
            <h1 className="text-xl font-bold text-rose-950">Application Unavailable</h1>
            <p className="mt-2 text-sm text-rose-800">{error || "Record not found."}</p>
            <div className="mt-6">
              <Link
                href="/applications"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to My Applications
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const currentStatus = application.status || "Pending";
  const isRejected = currentStatus === "Rejected";
  const isApproved = currentStatus === "Approved";
  const isUnderReview = currentStatus === "Under Review";

  return (
    <AuthGuard>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Applications
          </Link>
        </div>

        {/* Application Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={currentStatus} />
                <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  REF: {application.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {application.schemeName || "Welfare Scheme Application"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Submitted on {formatDate(application.createdAt)}
              </p>
            </div>

            {application.schemeId && (
              <Link
                href={`/schemes/${application.schemeId}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shrink-0"
              >
                View Scheme Guidelines
              </Link>
            )}
          </div>

          {/* Visual Status Pipeline Stepper */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Application Processing Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">1. Submitted</p>
                  <p className="text-[11px] text-emerald-700">Logged on portal</p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isUnderReview || isApproved || isRejected
                    ? "border-blue-200 bg-blue-50/60"
                    : "border-slate-200 bg-slate-50 opacity-60"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isUnderReview || isApproved || isRejected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isUnderReview || isApproved || isRejected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">2. Review</p>
                  <p className="text-[11px] text-slate-500">Document inspection</p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isApproved
                    ? "border-emerald-300 bg-emerald-50"
                    : isRejected
                    ? "border-rose-300 bg-rose-50"
                    : "border-slate-200 bg-slate-50 opacity-60"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isApproved
                      ? "bg-emerald-600 text-white"
                      : isRejected
                      ? "bg-rose-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isRejected ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    "3"
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    3. {isRejected ? "Rejected" : isApproved ? "Approved" : "Decision"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isRejected ? "Action required" : isApproved ? "Benefit issued" : "Pending officer review"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Alert Banner (if applicable) */}
        {isRejected && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              Application Rejected by Reviewing Authority
            </div>
            <p className="text-xs text-rose-800 leading-relaxed pl-7">
              <strong>Official Remark: </strong>
              {application.rejectionReason || "No specific feedback was supplied. Please verify that all criteria match your submitted certificates."}
            </p>
          </div>
        )}

        {/* Applicant Submission Details Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Submitted Citizen Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block mb-1">Applicant Name</span>
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
              <span className="text-slate-400 block mb-1">Last System Update</span>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {formatDate(application.updatedAt)}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block mb-1">Permanent Residential Address</span>
              <p className="font-semibold text-slate-900 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{application.address || "N/A"}</span>
              </p>
            </div>

            {application.reason && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 block mb-1">Statement of Need / Justification</span>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {application.reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}