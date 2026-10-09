"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { Shield, Zap, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Script from "next/script";
import api from "@/lib/api";
import posthog from "posthog-js";

export default function SubscriptionPage() {
  const { subscription } = useAuth();

  const status = subscription?.status || 'ACTIVE';
  const currentPlanType = subscription?.plan_type || 'TRIAL';
  const daysRemaining = subscription?.days_remaining || 0;

  const [hoveredPlan, setHoveredPlan] = useState<'FIRST_YEAR' | 'SECOND_YEAR'>(
    currentPlanType === 'TRIAL' ? 'FIRST_YEAR' : 'SECOND_YEAR'
  );
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{
    title: string;
    price: string;
    subtitle: string;
  } | null>(null);
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  const endDate = subscription?.end_date ? new Date(subscription.end_date) : new Date();
  const endDateStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const getStatusColor = () => {
    if (status === 'ACTIVE') return 'text-green-600';
    if (status === 'EXPIRING_WARNING') return 'text-blue-600';
    if (status === 'READ_ONLY_GRACE') return 'text-amber-600';
    return 'text-red-600';
  };

  const handleContactClick = (planTitle: string, price: string, subtitle: string) => {
    setSelectedPlanDetails({ title: planTitle, price, subtitle });
    posthog.capture("subscription_plan_contact_clicked", {
      plan_title: planTitle,
      price: price,
      current_plan: currentPlanType,
      days_remaining: daysRemaining,
    });
    setContactModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 pb-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-800 tracking-tight">Billing &amp; Plans</h1>
          <p className="text-gray-500 mt-2">Manage your active plans, platform access, and cloud subscriptions.</p>
        </div>
      </div>

      {/* Active Subscription Status Block */}
      <div className="neu-card p-6 mb-12" style={{ borderRadius: '20px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* Status */}
          <div className="bg-cb-bg shadow-neu-inset rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${status === 'ACTIVE' ? 'bg-green-100' : status === 'LOCKED_OUT' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
              {status === 'ACTIVE' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> :
                status === 'LOCKED_OUT' ? <Shield className="w-6 h-6 text-red-600" /> :
                  <Clock className="w-6 h-6 text-amber-600" />}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</div>
              <div className={`text-base font-bold ${getStatusColor()}`}>{status.replace(/_/g, ' ')}</div>
            </div>
          </div>

          {/* Plan */}
          <div className="bg-cb-bg shadow-neu-inset rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Current Plan</div>
            <div className="text-xl font-black text-gray-800">{currentPlanType.replace(/_/g, ' ')}</div>
          </div>

          {/* Validity */}
          <div className="bg-cb-bg shadow-neu-inset rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Valid Until</div>
            <div className="text-xl font-black text-gray-800">{endDateStr}</div>
          </div>

          {/* Days Remaining */}
          <div className="bg-cb-bg shadow-neu-inset rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Days Remaining</div>
            <div className={`text-3xl font-black ${getStatusColor()}`}>{Math.max(0, daysRemaining)}</div>
          </div>
        </div>
      </div>

      {/* Pricing Header */}
      <div className="text-center mb-8 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-800 tracking-tight">
          CottBook Annual Subscription
        </h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
          One unified software suite for cotton brokers. Pay for your initial setup &amp; 1st-year license, then renew at a low annual maintenance rate afterwards.
        </p>
      </div>

      {/* ── UNIFIED LIFECYCLE SHOWCASE CARD (Clear Chronological Hierarchy) ── */}
      <div className="max-w-5xl mx-auto bg-white rounded-[32px] border-2 border-slate-200/90 shadow-xl overflow-hidden mb-6">

        {/* Top Sequence Timeline Header */}
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cb-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              1
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Step 1</div>
              <div className="text-sm font-extrabold text-gray-800">First Year Setup &amp; Access</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-cb-primary font-bold text-xs uppercase tracking-wider bg-blue-50/80 border border-blue-200/60 px-4 py-1.5 rounded-full">
            <span>Then Renews Annually</span>
            <span className="text-base leading-none">➔</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              2
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Step 2 (Afterwards)</div>
              <div className="text-sm font-extrabold text-gray-800">Annual Cloud &amp; Maintenance</div>
            </div>
          </div>
        </div>

        {/* 2-Column Sequential Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">

          {/* ── PHASE 1: FIRST YEAR ── */}
          <div className="p-6 sm:p-10 flex flex-col justify-between bg-white relative">
            <div>
              {/* Stage Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ color: "#8c5e47", backgroundColor: "#fbf2eb" }}
                >
                  FIRST YEAR
                </span>
                {currentPlanType === 'TRIAL' && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Current Step
                  </span>
                )}
              </div>

              {/* Price & Subtitle */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="text-4xl sm:text-5xl font-black tracking-tight my-1" style={{ color: "#04294E" }}>
                  ₹30,000
                </div>
                <div className="text-base sm:text-lg font-bold mt-1" style={{ color: "#04294E" }}>
                  Setup
                </div>
                <div className="text-xs sm:text-sm font-semibold mt-0.5" style={{ color: "#8c5e47" }}>
                  First-year price (All-inclusive deployment &amp; license)
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-3 leading-relaxed">
                  Paid once upon joining. Covers private database initialization and 365 days of full software access.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Included in First Year:</div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold">Dedicated Cloud Database:</strong> Private, fast database instance provisioned specifically for your firm.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold">Full Suite Access (365 Days):</strong> Bargains, Passings, Split Deliveries &amp; GST Bill Generation.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold">Daily Encrypted Cloud Backups:</strong> Automated snapshots ensuring 100% data protection.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 Indicator Pill */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-700">One-time initial fee</span>
              <span className="font-bold text-cb-primary">Renews at ₹18,000/yr next year</span>
            </div>
          </div>

          {/* ── PHASE 2: FROM SECOND YEAR ── */}
          <div className="p-6 sm:p-10 flex flex-col justify-between bg-slate-50/40 relative">
            <div>
              {/* Stage Badge */}
              <div className="flex items-center mb-3">
                <span
                  className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ color: "#8c5e47", backgroundColor: "#fbf2eb" }}
                >
                  SECOND YEAR
                </span>
              </div>

              {/* Price & Subtitle */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="text-4xl sm:text-5xl font-black tracking-tight my-1 flex items-baseline gap-2" style={{ color: "#187741" }}>
                  ₹18,000
                  <span className="text-base sm:text-lg font-bold text-gray-500">/ year</span>
                </div>
                <div className="text-base sm:text-lg font-bold mt-1" style={{ color: "#04294E" }}>
                  per year
                </div>
                <div className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: "#04294E" }}>
                  Cloud database fees + maintenance
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-3 leading-relaxed">
                  Starting Year 2, pay only for high-speed cloud database server hosting, regular security maintenance, and all future updates.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-3.5 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Covered Under Annual Renewal:</div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold">Managed Cloud Server Hosting:</strong> High-availability servers with 99.9% uptime &amp; fast query speeds.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold">Ongoing System Maintenance:</strong> Database performance monitoring and security updates.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900 font-semibold">All Platform Updates &amp; Features:</strong> Instant access to all new software updates and reports.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Indicator Pill */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Zero setup fee from Year 2</span>
              <span className="font-bold text-green-700">Flat ₹18,000 / year</span>
            </div>
          </div>

        </div>

        {/* ── UNIFIED CALL-TO-ACTION FOOTER ── */}
        <div className="bg-slate-50 border-t border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-gray-900 text-base sm:text-lg">
              {currentPlanType === 'TRIAL'
                ? "Ready to activate CottBook for your brokerage?"
                : "Extend your CottBook subscription"}
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">
              {currentPlanType === 'TRIAL'
                ? "First Year: ₹30,000 covers full setup + 1 year license. Subsequent renewal will be ₹18,000/year."
                : "Annual Renewal: ₹18,000 covers cloud database hosting & ongoing maintenance for 365 days."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {currentPlanType === 'TRIAL' ? (
              <button
                onClick={() => handleContactClick('First-Year Plan', '₹30,000', 'Setup + 1 Year Full License')}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.99] cursor-pointer text-sm sm:text-base whitespace-nowrap"
              >
                Subscribe for Year 1 (₹30,000)
              </button>
            ) : (
              <button
                onClick={() => handleContactClick('Annual Renewal', '₹18,000 / year', 'Cloud Database Fees + Maintenance')}
                className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.99] cursor-pointer text-sm sm:text-base whitespace-nowrap"
              >
                Renew for Next Year (₹18,000 / yr)
              </button>
            )}

            <button
              onClick={() => handleContactClick('Subscription Inquiry', '₹30,000 First Year / ₹18,000 Renewal', 'Full Suite License')}
              className="w-full sm:w-auto px-5 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all cursor-pointer text-sm sm:text-base whitespace-nowrap"
            >
              Contact Sales
            </button>
          </div>
        </div>

      </div>



      {/* Manual Subscription Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cb-bg rounded-[30px] shadow-neu p-6 sm:p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl sm:text-2xl font-bold font-playfair text-gray-800 mb-1">
              {selectedPlanDetails ? selectedPlanDetails.title : "Subscribe to CottBook"}
            </h3>

            {selectedPlanDetails && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-cb-primary mb-3">
                <span>{selectedPlanDetails.price}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{selectedPlanDetails.subtitle}</span>
              </div>
            )}

            <p className="text-gray-600 mb-5 text-xs sm:text-sm leading-relaxed">
              Please connect with us directly via WhatsApp or Email to process your payment and activate your subscription seamlessly.
            </p>

            <div className="bg-cb-bg rounded-2xl shadow-neu-inset p-5 mb-5">
              <div className="flex flex-col items-center justify-center mb-4">
                <img
                  src="/whatsapp_qr.png"
                  alt="WhatsApp QR Code"
                  className="w-40 h-40 sm:w-44 sm:h-44 rounded-xl shadow-sm mb-2 object-cover bg-white p-1"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scan to chat on WhatsApp</span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center border-b border-gray-200/80 pb-2">
                  <span className="text-gray-400 font-medium">Contact Person:</span>
                  <span className="font-bold text-gray-800">Daksh Sethi</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200/80 pb-2">
                  <span className="text-gray-400 font-medium">Email:</span>
                  <a href="mailto:cottbook2026@gmail.com" className="font-bold text-blue-600 hover:underline">cottbook2026@gmail.com</a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">WhatsApp / Phone:</span>
                  <a href="tel:+918269603271" className="font-bold text-gray-800 hover:text-green-600">+91 8269603271</a>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={`https://wa.me/918269603271?text=${encodeURIComponent(
                  `Hi Daksh, I would like to subscribe to CottBook (${selectedPlanDetails?.title || 'Subscription'} - ${selectedPlanDetails?.price || ''}). Please share details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-center text-sm shadow-sm transition-all"
              >
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-5 py-3 bg-cb-bg rounded-xl shadow-neu text-gray-700 font-bold hover:shadow-neu-pressed transition-all duration-200 text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
