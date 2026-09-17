import { XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { BEFORE_AFTER_ITEMS, APP_LINKS } from "@/data/landingData";

export default function BeforeAfter() {
  return (
    <section className="py-20 lg:py-28 bg-white border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            Pain Point Agitation
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#04294E] tracking-tight mt-3">
            The Old Paper & Excel Way vs. The CottBook Operating System
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Traditional cotton brokerage is held back by verbal misunderstandings, missing lot numbers, and delayed brokerage billing. Here is how modern brokerage firms switch gears.
          </p>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Old Way Column */}
          <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Traditional & Fragile
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    The Diary & Excel Sheet Way
                  </h3>
                </div>
                <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  ✕
                </span>
              </div>

              {/* Pain Points List */}
              <div className="space-y-5 mt-6">
                {BEFORE_AFTER_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <XCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      {item.pain}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200 text-xs text-slate-500 font-medium">
              Result: Unnecessary rate disputes, overlooked brokerage, and stressful audit seasons.
            </div>
          </div>

          {/* CottBook Way Column (Highlighted) */}
          <div className="rounded-3xl bg-[#F0FDF4] border-2 border-[#2D5A27] p-6 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-[#2D5A27]/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#2D5A27]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#2D5A27]/20">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                    Modern B2B SaaS
                  </span>
                  <h3 className="text-xl font-black text-[#04294E] mt-0.5">
                    The CottBook Operating System
                  </h3>
                </div>
                <span className="w-9 h-9 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center font-bold shadow-md shadow-[#2D5A27]/30">
                  ✓
                </span>
              </div>

              {/* Solutions List */}
              <div className="space-y-5 mt-6">
                {BEFORE_AFTER_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <CheckCircle size={20} className="text-[#2D5A27] shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-[#2D5A27]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-[#2D5A27]">
                Result: Zero disputes, faster saudas, and 100% reconciled balance books.
              </span>
              <a
                href={APP_LINKS.register}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2D5A27] hover:underline"
              >
                <span>Upgrade Today</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
