"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, Layers, ArrowLeft, PlusCircle } from "lucide-react";

export default function AdminHeader({ title, subtitle, action }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin", icon: ShieldCheck },
    { label: "Schemes Directory", href: "/admin/schemes", icon: Layers },
    { label: "Applications Queue", href: "/admin/applications", icon: FileText },
  ];

  return (
    <div className="mb-8 border-b border-slate-200 bg-white shadow-sm -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      {/* Top Banner with Citizen view shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-500/20">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
            Administrator Control Center
          </span>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Switch to Citizen Dashboard
        </Link>
      </div>

      {/* Main Page Title & Optional Action Button */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        {action && (
          <div className="flex items-center gap-3">
            {action}
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="mt-6 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="ml-auto pl-2">
          <Link
            href="/admin/schemes/add"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition whitespace-nowrap"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Scheme
          </Link>
        </div>
      </div>
    </div>
  );
}
