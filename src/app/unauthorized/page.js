import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            403 - Restricted Zone
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            You do not have administrative privileges to view this section of Yojana Sathi. Please return to the citizen portal or sign in with an authorized administrator credential.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Home className="h-4 w-4" />
            Citizen Dashboard
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <LogIn className="h-4 w-4" />
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
