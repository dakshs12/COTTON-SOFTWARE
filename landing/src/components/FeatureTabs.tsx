"use client";

import { useState } from "react";
import {
  FileText,
  CheckSquare,
  Truck,
  BookOpen,
  Receipt,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Printer,
  Download,
  Share2,
} from "lucide-react";
import { FEATURE_TABS, APP_LINKS } from "@/data/landingData";

export default function FeatureTabs() {
  const [activeTabId, setActiveTabId] = useState(FEATURE_TABS[0].id);

  const activeFeature = FEATURE_TABS.find((t) => t.id === activeTabId) || FEATURE_TABS[0];

  const getTabIcon = (id: string) => {
    switch (id) {
      case "bargain-entry":
        return <FileText size={18} />;
      case "passing-approval":
        return <CheckSquare size={18} />;
      case "delivery-tracking":
        return <Truck size={18} />;
      case "party-reconciliation":
        return <BookOpen size={18} />;
      case "brokerage-invoicing":
        return <Receipt size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  return (
    <section id="features" className="py-24 lg:py-32 bg-[#F8FAFC] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#2D5A27] border border-[#DCFCE7] uppercase tracking-wider">
            Built For Cotton Trading
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#04294E] tracking-tight mt-3">
            Every Step of Your Cotton Deal, Completely Automated
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Click through our 5 core workflows to see how CottBook replaces scattered WhatsApp chats with an end-to-end digital audit trail.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-start lg:justify-center overflow-x-auto pb-4 mb-10 gap-2.5 no-scrollbar">
          {FEATURE_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#2D5A27] text-white shadow-lg shadow-[#2D5A27]/25 scale-[1.02]"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <span className={isActive ? "text-emerald-200" : "text-slate-400"}>
                  {getTabIcon(tab.id)}
                </span>
                <span>{tab.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Interactive Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-10 card-elevation">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Descriptions & Bullet Points */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#2D5A27] border border-[#DCFCE7]">
                    {activeFeature.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Workflow #{FEATURE_TABS.findIndex((t) => t.id === activeTabId) + 1}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#04294E] tracking-tight">
                  {activeFeature.title}
                </h3>

                <p className="text-base text-slate-700 font-semibold mt-3">
                  {activeFeature.tagline}
                </p>

                <p className="text-sm text-slate-600 font-normal leading-relaxed mt-2">
                  {activeFeature.description}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="space-y-3 pt-2">
                {activeFeature.bulletPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-[#2D5A27] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium leading-normal">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <a
                  href={APP_LINKS.register}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D5A27] hover:bg-[#22441E] text-white text-sm font-bold shadow-md shadow-[#2D5A27]/20 transition-all hover:gap-3"
                >
                  <span>Try this in 14-Day Free Trial</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Right Column: Simulated Live UI Card Component */}
            <div className="lg:col-span-7 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-5 sm:p-7 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#04294E] text-white flex items-center justify-center font-bold text-xs">
                    CB
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      Ref: {activeFeature.mockupData.dealId}
                    </span>
                    <span className="text-[11px] text-slate-500">Live Operating Record</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#2D5A27] border border-[#2D5A27]/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                  {activeFeature.mockupData.status}
                </span>
              </div>

              {/* Deal Parties Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Buyer (Mill / Trader)
                    </span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      {activeFeature.mockupData.buyer}
                    </span>
                    <span className="text-slate-500 text-[11px]">{activeFeature.mockupData.station}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Seller (Ginning Factory)
                    </span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      {activeFeature.mockupData.seller}
                    </span>
                    <span className="text-slate-500 text-[11px]">Direct Mandi Origin</span>
                  </div>
                </div>

                {/* Core Parameters Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Volume</span>
                    <span className="text-sm sm:text-base font-black text-[#04294E] font-mono">
                      {activeFeature.mockupData.bales.toLocaleString()} Bales
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade / Staple</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block mt-0.5">
                      {activeFeature.mockupData.variety}
                    </span>
                  </div>
                  <div className="bg-[#F0FDF4] p-2 rounded-lg border border-[#DCFCE7]">
                    <span className="text-[10px] uppercase font-bold text-[#2D5A27] block">Booked Price</span>
                    <span className="text-sm sm:text-base font-black text-[#2D5A27] font-mono">
                      {activeFeature.mockupData.rate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeFeature.mockupData.metrics.map((m, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {m.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#04294E] mt-0.5 block">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini Action Toolbar */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles size={14} className="text-[#2D5A27]" />
                  Auto-synced across buyer & seller ledgers
                </span>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer">
                    <Printer size={14} />
                  </span>
                  <span className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer">
                    <Download size={14} />
                  </span>
                  <span className="p-1.5 rounded-lg bg-[#2D5A27] text-white cursor-pointer">
                    <Share2 size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
