"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Share2,
  TrendingUp,
  Sparkles,
  Printer,
  Download,
  Phone,
  Clock,
  ExternalLink,
} from "lucide-react";
import { APP_LINKS, HERO_STATS } from "@/data/landingData";

export default function HeroSection() {
  const [activeMockupTab, setActiveMockupTab] = useState<"dashboard" | "bargain">("dashboard");

  return (
    <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-32 overflow-hidden">
      {/* Cotton Landscape Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-top sm:bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: "url('/login-screen-bg.png')",
        }}
      />

      {/* Subtle Light Overlay & Bottom Transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-[#F8FAF7] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Conversion Messaging */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#04294E] leading-[1.12]">
            Stop Managing Cotton Trades on{" "}
            <span className="relative inline-block text-slate-400 line-through decoration-rose-500 decoration-3">
              traditional excel sheets
            </span>
            <br className="hidden sm:inline" />
            <span className="text-[#2D5A27] block sm:inline sm:ml-2">
              Run Your Brokerage on CottBook.
            </span>
          </h1>

          {/* Sub-Headline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto font-normal leading-relaxed">
            The complete digital operating system for modern cotton brokers. Seamlessly manage all your business operations — <strong className="font-semibold text-slate-900">Bargain Entry</strong>, <strong className="font-semibold text-slate-900">Quality Passing</strong>, <strong className="font-semibold text-slate-900">Delivery Tracking</strong>, <strong className="font-semibold text-slate-900">Invoice Generation</strong>, and <strong className="font-semibold text-slate-900">Pending Due Lists</strong> — while generating official branded WhatsApp contract notes in seconds.
          </p>

          {/* Primary Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={APP_LINKS.register}
              className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold text-white bg-[#2D5A27] hover:bg-[#22441E] rounded-2xl shadow-xl shadow-[#2D5A27]/25 hover:shadow-2xl hover:shadow-[#2D5A27]/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-4 text-base font-bold text-slate-700 hover:text-[#04294E] bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>Explore Workflows</span>
            </a>
          </div>

          {/* Risk Reversal Subtext */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <CheckCircle2 size={16} className="text-[#2D5A27]" />
            <span>No credit card required</span>
            <span className="text-slate-300">•</span>
            <CheckCircle2 size={16} className="text-[#2D5A27]" />
            <span>Instant 2-minute setup</span>
            <span className="text-slate-300">•</span>
            <CheckCircle2 size={16} className="text-[#2D5A27]" />
            <span>100% private tenant data</span>
          </div>
        </div>

        {/* Hero Interactive Visual: CottBook Master Dashboard Mockup */}
        <div className="mt-14 relative max-w-6xl mx-auto">
          {/* Main App Window Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden card-elevation">
            {/* Mac-style Window Top Bar */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-medium text-slate-400 font-mono hidden sm:inline-block">
                  https://app.cottbook.com/dashboard
                </span>
              </div>

              {/* Mockup Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setActiveMockupTab("dashboard")}
                  className={`px-3 py-1 rounded-md transition-all font-medium ${
                    activeMockupTab === "dashboard"
                      ? "bg-[#2D5A27] text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Master Audit Dashboard
                </button>
                <button
                  onClick={() => setActiveMockupTab("bargain")}
                  className={`px-3 py-1 rounded-md transition-all font-medium ${
                    activeMockupTab === "bargain"
                      ? "bg-[#2D5A27] text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live Contract Note
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tenant: Balaji Cotton Indore (Secure)</span>
              </div>
            </div>

            {/* Dashboard Content */}
            {activeMockupTab === "dashboard" ? (
              <div className="p-5 sm:p-7 bg-[#F8FAFC]">
                {/* Firm Header Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
                  <div>
                    <h3 className="text-xl font-black text-[#04294E] tracking-tight">
                      Shree Balaji Cotton Brokerage & Commission Agency
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Station: Indore (M.P.) • GSTIN: 23AABCS1429K1Z4 • FY 2026-27 Active Ledger
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F0FDF4] text-[#2D5A27] border border-[#DCFCE7] flex items-center gap-1.5">
                      <Sparkles size={13} />
                      Live Data Sync
                    </span>
                    <a
                      href={APP_LINKS.register}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#2D5A27] text-white hover:bg-[#22441E] transition-colors flex items-center gap-1"
                    >
                      <span>Try Live</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Deals Done</p>
                    <p className="text-2xl sm:text-3xl font-black text-[#04294E] mt-1">162</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ +14 new this week</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">Total Bales Booked</p>
                    <p className="text-2xl sm:text-3xl font-black text-[#2D5A27] mt-1">18,400</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Average ₹61,250/Candy</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Dispatched Bales</p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">14,200</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Linked to truck weigh slips</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-amber-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending To Dispatch</p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-800 mt-1">4,200</p>
                    <p className="text-[11px] text-amber-700 font-medium mt-1">Active ginner audit alert</p>
                  </div>
                </div>

                {/* Live Recent Bargains Table Mockup */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#04294E]">
                      Recent Saudas & Status Tracker
                    </span>
                    <span className="text-[11px] text-slate-500">Showing last 4 verified transactions</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/40">
                          <th className="py-2.5 px-3 whitespace-nowrap">Deal ID</th>
                          <th className="py-2.5 px-3">Buyer</th>
                          <th className="py-2.5 px-3">Seller (Ginner)</th>
                          <th className="py-2.5 px-3">Variety</th>
                          <th className="py-2.5 px-3 text-right">Bales</th>
                          <th className="py-2.5 px-3 text-right">Rate / Candy</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-[#04294E]">26-27/112</td>
                          <td className="py-3 px-3 font-bold text-slate-900">Vardhman Textiles Ltd</td>
                          <td className="py-3 px-3">Shubham Cotton Amravati</td>
                          <td className="py-3 px-3 font-medium text-slate-600">Shankar-6 (29mm)</td>
                          <td className="py-3 px-3 text-right font-black text-[#04294E]">100</td>
                          <td className="py-3 px-3 text-right font-semibold">₹ 58,500</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Dispatched
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-[#04294E]">26-27/119</td>
                          <td className="py-3 px-3 font-bold text-slate-900">Tirupati Spinning Mills</td>
                          <td className="py-3 px-3">Mahalaxmi Cottons Rajkot</td>
                          <td className="py-3 px-3 font-medium text-slate-600">Shankar-6 (28.5mm)</td>
                          <td className="py-3 px-3 text-right font-black text-[#04294E]">300</td>
                          <td className="py-3 px-3 text-right font-semibold">₹ 61,500</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Passed (Lot-93)
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-[#04294E]">26-27/127</td>
                          <td className="py-3 px-3 font-bold text-slate-900">Kishan Agro Ginning</td>
                          <td className="py-3 px-3">Narmada Ginning Dhamnod</td>
                          <td className="py-3 px-3 font-medium text-slate-600">MCU-5 (31mm)</td>
                          <td className="py-3 px-3 text-right font-black text-[#04294E]">100</td>
                          <td className="py-3 px-3 text-right font-semibold">₹ 64,000</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Pending Passing
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-[#04294E]">26-27/132</td>
                          <td className="py-3 px-3 font-bold text-slate-900">Om Sai Spinners Guntur</td>
                          <td className="py-3 px-3">Mahalaxmi Cottons Rajkot</td>
                          <td className="py-3 px-3 font-medium text-slate-600">Shankar-6 (29mm)</td>
                          <td className="py-3 px-3 text-right font-black text-[#04294E]">700</td>
                          <td className="py-3 px-3 text-right font-semibold">₹ 58,000</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Partial Dispatched
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Contract Slip View */
              <div className="p-6 sm:p-8 bg-slate-100 flex justify-center items-center">
                <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-300 shadow-xl p-6 relative">
                  {/* Letterhead Banner */}
                  <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black tracking-wide text-slate-900 uppercase">
                        Shree Balaji Cotton Brokerage
                      </h4>
                      <p className="text-[11px] text-slate-600">Cotton Commission Agent • Station: Indore (M.P.)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#2D5A27] block">DEAL #26-27/112</span>
                      <span className="text-[10px] text-slate-500">Date: 12-Sep-2026</span>
                    </div>
                  </div>

                  {/* Contract Slip Content */}
                  <div className="text-xs space-y-3 text-slate-700">
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Buyer (Mill)</span>
                        <span className="font-bold text-slate-900 block text-sm">Vardhman Textiles Ltd</span>
                        <span className="text-slate-500">Ludhiana (Punjab)</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Seller (Ginner)</span>
                        <span className="font-bold text-slate-900 block text-sm">Narmada Ginning & Pressing</span>
                        <span className="text-slate-500">Dhamnod (M.P.)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Quantity</span>
                        <span className="font-extrabold text-sm text-[#04294E]">100 Bales</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Variety / Staple</span>
                        <span className="font-extrabold text-sm text-[#04294E]">S-6 29mm</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Rate / Candy</span>
                        <span className="font-extrabold text-sm text-[#2D5A27]">₹ 58,500</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                      <p>• <strong>Payment Condition:</strong> 30 Days from Truck Dispatch Date</p>
                      <p>• <strong>Weight Terms:</strong> Mill Net Weight (Weighbridge Slip Required)</p>
                      <p>• <strong>Delivery Type:</strong> Spot / F.O.R Mill Premises</p>
                    </div>

                    {/* Slip Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#2D5A27] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                        Ready for WhatsApp
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1">
                          <Printer size={13} />
                          Print PDF
                        </button>
                        <a
                          href={APP_LINKS.register}
                          className="px-3 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Share2 size={13} />
                          Send WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating WhatsApp Slip Card - Overlaying the Mockup */}
          <div className="hidden lg:block absolute -bottom-10 -left-6 z-20 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-80 card-elevation animate-bounce duration-1000">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#2D5A27] border border-[#2D5A27]/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-ping" />
                Instant WhatsApp Slip
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1-Click PDF</span>
            </div>

            <p className="text-xs font-bold text-[#04294E]">
              Bargain Confirmation: #26-27/112
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Shankar-6 29mm • 100 Bales • ₹58,500/Candy
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-emerald-700">Delivered to Buyer & Ginner</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono">
                ✓✓ Read
              </span>
            </div>
          </div>

          {/* Floating Security Badge Card */}
          <div className="hidden lg:flex items-center gap-3 absolute -top-6 -right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-3.5 card-elevation">
            <div className="w-10 h-10 rounded-xl bg-[#04294E] text-white flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#04294E]">100% Broker Confidentiality</p>
              <p className="text-[11px] text-slate-500">Tenant cryptographic rate isolation</p>
            </div>
          </div>
        </div>

        {/* Hero Trust Badges Strip */}
        <div className="mt-20 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {HERO_STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-[#04294E] tracking-tight font-mono">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
