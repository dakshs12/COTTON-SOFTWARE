import { HOW_IT_WORKS_STEPS, APP_LINKS } from "@/data/landingData";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white border-t border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#2D5A27] border border-[#DCFCE7] uppercase tracking-wider">
            Fast Onboarding
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#04294E] tracking-tight mt-3">
            Up & Running in Under 5 Minutes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            No complex installations or long training sessions. CottBook is designed to feel natural for any traditional cotton broker on day one.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
          {HOW_IT_WORKS_STEPS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] rounded-3xl border border-slate-200/80 p-8 flex flex-col justify-between relative card-elevation-hover group"
            >
              <div>
                <span className="text-4xl sm:text-5xl font-black text-[#2D5A27]/20 font-mono group-hover:text-[#2D5A27] transition-colors duration-200 block mb-4">
                  {item.step}
                </span>

                <h3 className="text-xl font-black text-[#04294E] tracking-tight mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#2D5A27]">
                <span>Stage {idx + 1} of 3</span>
                <span className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#2D5A27]">
                  ✓
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-14 max-w-3xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-[#04294E] to-[#1E293B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sparkles size={24} className="text-amber-400 shrink-0 hidden sm:block" />
            <div>
              <p className="font-bold text-sm sm:text-base">Ready to test it with your next live sauda?</p>
              <p className="text-xs text-slate-300">Set up your account right now without giving any credit card details.</p>
            </div>
          </div>

          <a
            href={APP_LINKS.register}
            className="px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#22441E] text-white text-xs sm:text-sm font-bold whitespace-nowrap shadow-md flex items-center gap-2"
          >
            <span>Start Free Trial</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
