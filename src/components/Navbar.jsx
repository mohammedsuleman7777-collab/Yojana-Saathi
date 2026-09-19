"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Bookmark,
  FileText,
  Search,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMenu() {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }

  const navLinks = [
    { name: "Browse Schemes", href: "/schemes", icon: Search },
    { name: "Eligibility Matcher", href: "/eligibility", icon: Sparkles },
    { name: "Saved Schemes", href: "/saved-schemes", icon: Bookmark, authRequired: true },
    { name: "My Applications", href: "/applications", icon: FileText, authRequired: true },
  ];

  const visibleLinks = navLinks.filter(link => !link.authRequired || user);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <LandmarkIcon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-none">
                  योजना<span className="text-emerald-700">साथी</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block leading-tight">
                  Yojana Sathi
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-emerald-700 bg-emerald-50/80 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/20"
                    : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2 pr-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs">
                    {(profile?.name || user.displayName || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-xs font-semibold">
                    {profile?.name || user.displayName || "My Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-900/10 focus:outline-none animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profile?.name || user.displayName || "User"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {profile?.role && (
                        <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {profile.role}
                        </span>
                      )}
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                      Citizen Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Eligibility Profile
                    </Link>

                    <Link
                      href="/applications"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      My Applications
                    </Link>

                    <Link
                      href="/saved-schemes"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                      Saved Schemes
                    </Link>

                    {profile?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 transition"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                        Admin Console
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                {(profile?.name || user.displayName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {profile?.name || user.displayName || "Citizen"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {user && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === "/dashboard"
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                Citizen Dashboard
              </Link>
            )}

            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  {link.name}
                </Link>
              );
            })}

            {user && (
              <Link
                href="/profile"
                onClick={closeMenu}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === "/profile"
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </Link>
            )}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-100 text-amber-900 font-semibold"
                    : "text-amber-800 hover:bg-amber-50"
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function LandmarkIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="6" y1="21" x2="6" y2="10" />
      <line x1="10" y1="21" x2="10" y2="10" />
      <line x1="14" y1="21" x2="14" y2="10" />
      <line x1="18" y1="21" x2="18" y2="10" />
      <polygon points="12 2 2 7 22 7 12 2" />
    </svg>
  );
}
