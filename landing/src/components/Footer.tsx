import Link from "next/link";
import { Mail, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { APP_LINKS } from "@/data/landingData";

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 text-xs sm:text-sm border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-200">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <img
                src="/full-logo-main.svg"
                alt="CottBook — Software for Cotton Brokers"
                className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              />
            </Link>

            <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed">
              CottBook is the premier digital operating system designed exclusively for Indian cotton brokers and commission agents. Eliminating verbal confusion, accelerating contract deliveries, and safeguarding private market rates.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#2D5A27] font-semibold pt-1">
              <ShieldCheck size={16} />
              <span>Multi-Tenant Encrypted Isolation • Cloud Hosted</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold text-[#04294E] uppercase tracking-wider mb-4">
              Platform & Features
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#features" className="text-slate-600 hover:text-[#2D5A27] transition-colors">
                  Bargain Contract Notes
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-600 hover:text-[#2D5A27] transition-colors">
                  Quality Passing & Lot Approval
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-600 hover:text-[#2D5A27] transition-colors">
                  Delivery & Logistics Tracking
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-600 hover:text-[#2D5A27] transition-colors">
                  Party Ledger Reconciliation
                </a>
              </li>
              <li>
                <a href="#features" className="text-slate-600 hover:text-[#2D5A27] transition-colors">
                  1-Click GST Brokerage Bills
                </a>
              </li>
              <li>
                <a href={APP_LINKS.register} className="text-[#2D5A27] hover:underline flex items-center gap-1 font-semibold">
                  <span>Start Free Trial</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support Column */}
          <div>
            <h4 className="text-xs font-bold text-[#04294E] uppercase tracking-wider mb-4">
              Contact & Headquarters
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="text-[#2D5A27] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${APP_LINKS.supportEmail}`}
                  className="text-slate-700 hover:text-[#2D5A27] transition-colors font-mono"
                >
                  {APP_LINKS.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#2D5A27] shrink-0 mt-0.5" />
                <span className="text-slate-700">Indore, Madhya Pradesh, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Developer Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CottBook. All rights reserved. Developed by Daksh Sethi.</p>

          <div className="flex items-center gap-5">
            <a href="https://app.cottbook.com/terms" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="https://app.cottbook.com/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#security" className="hover:text-slate-900 transition-colors">
              Broker Security Guarantee
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
