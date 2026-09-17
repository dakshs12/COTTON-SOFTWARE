"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { APP_LINKS, NAV_ITEMS } from "@/data/landingData";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav py-3 border-b border-slate-200/80 shadow-sm"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group py-0.5">
              <img
                src="/full-logo-main.svg"
                alt="CottBook — Software for Cotton Brokers"
                className="h-14 sm:h-16 lg:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              />
            </Link>
          </div>

          {/* Desktop Center Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-[#2D5A27] transition-colors duration-150 relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-[#2D5A27] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={APP_LINKS.login}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#04294E] hover:bg-slate-100 rounded-xl transition-all duration-150 border border-transparent hover:border-slate-200"
            >
              Log In
            </a>
            <a
              href={APP_LINKS.register}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2D5A27] hover:bg-[#22441E] rounded-xl shadow-md shadow-[#2D5A27]/25 hover:shadow-lg hover:shadow-[#2D5A27]/30 hover:-translate-y-0.5 transition-all duration-150 flex items-center gap-1.5"
            >
              <span>Sign Up Free</span>
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={APP_LINKS.register}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2D5A27] rounded-lg"
            >
              Sign Up
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-nav border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 mt-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 pt-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-[#F0FDF4] hover:text-[#2D5A27]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <a
              href={APP_LINKS.login}
              className="w-full text-center py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-sm"
            >
              Log In to Account
            </a>
            <a
              href={APP_LINKS.register}
              className="w-full text-center py-2.5 rounded-xl bg-[#2D5A27] text-white font-semibold text-sm shadow-md"
            >
              Start 14-Day Free Trial
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
