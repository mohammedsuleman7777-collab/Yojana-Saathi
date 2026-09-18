import Link from "next/link";
import { Landmark, Heart, ExternalLink, HelpCircle, ShieldCheck, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold">
                <Landmark className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                योजना साथी <span className="text-emerald-400">Yojana Sathi</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Indian citizens with an intelligent, transparent, and seamless gateway to Central & State welfare initiatives, financial aids, and socio-economic support.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                Citizen-First Initiative
              </span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/schemes" className="hover:text-emerald-400 transition-colors">
                  All Central & State Schemes
                </Link>
              </li>
              <li>
                <Link href="/eligibility" className="hover:text-emerald-400 transition-colors">
                  Check Scheme Eligibility
                </Link>
              </li>
              <li>
                <Link href="/saved-schemes" className="hover:text-emerald-400 transition-colors">
                  Bookmarked & Saved Schemes
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-emerald-400 transition-colors">
                  Track Application Status
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-400 transition-colors">
                  Update Citizen Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key National Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              National Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  National Portal of India
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.mygov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  MyGov Citizen Portal
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://dbtbharat.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  DBT Bharat (Direct Benefit Transfer)
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://digitalindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                >
                  Digital India
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Citizen Helpline & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Citizen Helpline
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Toll-Free Helpline</p>
                  <p className="text-slate-400">1800-11-2026 (Mon-Sat, 9am - 6pm)</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Support Desk</p>
                  <p className="text-slate-400">helpdesk@yojanasathi.gov.in</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-[11px]">
                    Zero application fees are charged on this platform. Beware of unauthorized intermediaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Yojana Sathi (योजना साथी). Built for Digital India Welfare.</p>
          <p className="inline-flex items-center gap-1">
            Designed with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for all citizens of India
          </p>
        </div>
      </div>
    </footer>
  );
}
