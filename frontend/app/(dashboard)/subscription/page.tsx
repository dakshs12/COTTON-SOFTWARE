"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { Shield, Zap, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Script from "next/script";
import api from "@/lib/api";
import posthog from "posthog-js";

export default function SubscriptionPage() {
  const { subscription } = useAuth();
  const [hoveredPlan, setHoveredPlan] = useState('3_YEAR');
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  const status = subscription?.status || 'ACTIVE';
  const currentPlanType = subscription?.plan_type || 'TRIAL';
  const daysRemaining = subscription?.days_remaining || 0;

  const endDate = subscription?.end_date ? new Date(subscription.end_date) : new Date();
  const endDateStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const getStatusColor = () => {
    if (status === 'ACTIVE') return 'text-green-600';
    if (status === 'EXPIRING_WARNING') return 'text-blue-600';
    if (status === 'READ_ONLY_GRACE') return 'text-amber-600';
    return 'text-red-600';
  };

  const handleContactClick = (planType: string) => {
    posthog.capture("subscription_plan_contact_clicked", {
      plan_type: planType,
      current_plan: currentPlanType,
      days_remaining: daysRemaining,
    });
    setContactModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-800 tracking-tight">Billing & Plans</h1>
          <p className="text-gray-500 mt-2">Manage your active plans, usage, and billing history.</p>
        </div>
      </div>

      {/* Active Subscription Status Block */}
      <div className="neu-card p-6 mb-12" style={{ borderRadius: '20px' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-playfair text-gray-800">
          {currentPlanType === 'TRIAL' ? "Select a Subscription Plan" : "Select a Renewal Plan"}
        </h2>
        <p className="text-gray-500 mt-2">All plans include full access to the Brokerage Management Suite.</p>
      </div>

      {/* Pricing Tier Grid (Centered 2-Card Layout) */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        onMouseLeave={() => setHoveredPlan('3_YEAR')}
      >

        {/* 1-Year Plan */}
        <div
          className={`rounded-[30px] p-8 flex flex-col transition-all duration-300 ${hoveredPlan === '1_YEAR'
            ? 'border-2 border-blue-500 bg-white shadow-xl -translate-y-1'
            : 'border-2 border-slate-200 bg-white/70 shadow-sm'
            }`}
          onMouseEnter={() => setHoveredPlan('1_YEAR')}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">1-Year Plan</h3>
            <p className="text-gray-500 text-sm">Standard core access for growing brokerages.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹TBA <span className="text-lg font-bold text-gray-400 mb-1 ml-1.5">/ year</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-gray-700 font-medium text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>Full Brokerage Management Suite Access</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 font-medium text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>Unlimited Bargains, Deliveries &amp; Invoices</span>
            </li>
          </ul>
          <button
            onClick={() => handleContactClick('1_YEAR')}
            className={`w-full py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 ${hoveredPlan === '1_YEAR'
              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md hover:bg-blue-700'
              : 'bg-transparent text-blue-600 border-2 border-blue-500 hover:bg-blue-50'
              }`}
          >
            Contact to Subscribe
          </button>
        </div>

        {/* 3-Year Plan (Featured / Highlighted Card) */}
        <div
          className={`rounded-[30px] p-8 flex flex-col relative transition-all duration-300 ${hoveredPlan === '3_YEAR'
            ? 'border-2 border-blue-500 bg-white shadow-xl -translate-y-1'
            : 'border-2 border-slate-200 bg-white/70 shadow-sm'
            }`}
          onMouseEnter={() => setHoveredPlan('3_YEAR')}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cb-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> SAVE 17%
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">3-Year Plan</h3>
            <p className="text-gray-500 text-sm">Long-term commitment with locked-in rates.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹TBA <span className="text-lg font-bold text-gray-400 mb-1 ml-1.5">total</span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-green-700 bg-green-100/90 border border-green-300 px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                Only ₹TBA / year equivalent
              </span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-gray-700 font-medium text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>Everything in 1-Year Plan</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 font-medium text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>Save ₹ &amp; Lock-in current rate against future price hikes</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700 font-medium text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span>Priority Support</span>
            </li>
          </ul>
          <button
            onClick={() => handleContactClick('3_YEAR')}
            className={`w-full py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 ${hoveredPlan === '3_YEAR'
              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md hover:bg-blue-700'
              : 'bg-transparent text-blue-600 border-2 border-blue-500 hover:bg-blue-50'
              }`}
          >
            Contact to Subscribe
          </button>
        </div>

      </div>

      {/* Manual Subscription Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-cb-bg rounded-[30px] shadow-neu p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold font-playfair text-gray-800 mb-2">Subscribe via Direct Payment</h3>
            <p className="text-gray-600 mb-6 text-sm">Please contact us via WhatsApp or Email to process your UPI payment and activate your subscription.</p>

            <div className="bg-cb-bg rounded-2xl shadow-neu-inset p-6 mb-6">
              <div className="flex flex-col items-center justify-center mb-6">
                <img src="/whatsapp_qr.png" alt="WhatsApp QR Code" className="w-48 h-48 rounded-lg shadow-sm mb-2 object-cover bg-white" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scan to WhatsApp</span>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">Name: Daksh Sethi</p>
                <p className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">Email: cottbook2026@gmail.com</p>
                <p className="text-sm font-medium text-gray-700">Phone / WhatsApp: +91 8269603271</p>
              </div>
            </div>

            <button
              onClick={() => setContactModalOpen(false)}
              className="w-full py-3 bg-cb-bg rounded-xl shadow-neu text-gray-700 font-bold hover:shadow-neu-pressed transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
