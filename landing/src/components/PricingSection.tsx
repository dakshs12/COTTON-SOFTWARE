"use client";

import { useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { PRICING_PLANS, APP_LINKS } from "@/data/landingData";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white border-t border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#2D5A27] border border-[#DCFCE7] uppercase tracking-wider">
            Simple, Honest Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#04294E] tracking-tight mt-3">
            Invest in Speed. Eliminate Brokerage Disputes.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Transparent pricing designed for independent brokers to large multi-state commission houses. Start risk-free with our 14-day unrestricted trial.
          </p>

          {/* Billing Frequency Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !isAnnual
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-[#2D5A27] text-white shadow-md shadow-[#2D5A27]/20"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isAnnual ? "bg-white/20 text-white" : "bg-[#DCFCE7] text-[#2D5A27]"
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-200 ${
                  plan.popular
                    ? "bg-[#F0FDF4] border-2 border-[#2D5A27] shadow-xl shadow-[#2D5A27]/10 lg:-translate-y-2"
                    : "bg-white border border-slate-200/90 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#2D5A27] text-white shadow-md flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>Recommended for Firms</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-[#04294E]">
                      {plan.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price Tag */}
                  <div className="mt-6 pb-6 border-b border-slate-200">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#04294E] font-mono">
                        ₹ {price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        / month {isAnnual ? "(billed yearly)" : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      + applicable GST • 14-day free full trial
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mt-6">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.popular ? "bg-[#2D5A27] text-white" : "bg-slate-100 text-[#2D5A27]"
                        }`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="mt-8 pt-6 border-t border-slate-200/80">
                  <a
                    href={APP_LINKS.register}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      plan.popular
                        ? "bg-[#2D5A27] hover:bg-[#22441E] text-white shadow-lg shadow-[#2D5A27]/25"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={15} />
                  </a>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Instant access in 2 mins
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
