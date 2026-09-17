"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { FAQS, APP_LINKS } from "@/data/landingData";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 lg:py-32 bg-[#F8FAFC] border-t border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#2D5A27] border border-[#DCFCE7] uppercase tracking-wider">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#04294E] tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Have questions about how CottBook protects your trade secrets, handles split deliveries, or connects to WhatsApp? Here are the answers.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm transition-all duration-150"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-[#04294E]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#2D5A27] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Assistance Box */}
        <div className="mt-12 text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#2D5A27] flex items-center justify-center shrink-0">
              <MessageCircle size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#04294E]">Have a specific workflow question?</p>
              <p className="text-xs text-slate-500">Our cotton tech team in Indore is here to guide you.</p>
            </div>
          </div>

          <a
            href={`mailto:${APP_LINKS.supportEmail}`}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Email Support ({APP_LINKS.supportEmail})
          </a>
        </div>
      </div>
    </section>
  );
}
