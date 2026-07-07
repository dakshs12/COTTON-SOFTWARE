"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { Shield, Zap, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Script from "next/script";

export default function SubscriptionPage() {
  const { subscription } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const status = subscription?.status || "PENDING";
  const daysRemaining = subscription?.days_remaining || 0;
  const currentPlanType = subscription?.plan_type || "None";
  const endDateStr = subscription?.end_date 
    ? (() => {
        const d = new Date(subscription.end_date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      })()
    : "N/A";

  // Dummy Dodo Payments invocation
  const handleCheckout = async (planId: string) => {
    if (!planId) {
      alert("Plan ID is missing. Please set NEXT_PUBLIC_DODO_PLAN_ID variables.");
      return;
    }
    
    setLoadingPlan(planId);
    
    // Simulate SDK load/network request
    setTimeout(() => {
      alert(`Dodo Payments Checkout Triggered for Plan ID: ${planId}`);
      setLoadingPlan(null);
    }, 1200);
  };

  const getStatusColor = () => {
    if (status === 'ACTIVE') return 'text-green-600';
    if (status === 'EXPIRING_WARNING') return 'text-blue-600';
    if (status === 'READ_ONLY_GRACE') return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* Optional: Load Dodo SDK if needed */}
      <Script src="https://js.dodopayments.com/v1" strategy="lazyOnload" />

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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              status === 'ACTIVE' ? 'bg-green-100' : status === 'LOCKED_OUT' ? 'bg-red-100' : 'bg-amber-100'
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
        <h2 className="text-2xl font-bold font-playfair text-gray-800">Select a Renewal Plan</h2>
        <p className="text-gray-500 mt-2">All plans include full access to the Brokerage Management Suite.</p>
      </div>

      {/* Pricing Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 1-Year Plan */}
        <div className="bg-cb-bg rounded-[30px] shadow-neu p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">1-Year Plan</h3>
            <p className="text-gray-500 text-sm">Standard core baseline.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹25,000 <span className="text-lg font-bold text-gray-400 mb-1 ml-1">/yr</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Full Suite Access
            </li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_DODO_PLAN_1_YEAR_ID || '')}
            disabled={loadingPlan !== null}
            className="w-full py-4 bg-cb-bg rounded-xl shadow-neu text-gray-600 font-bold hover:shadow-neu-pressed active:shadow-neu-pressed transition-all duration-200"
          >
            {loadingPlan === process.env.NEXT_PUBLIC_DODO_PLAN_1_YEAR_ID ? "Processing..." : "Select 1 Year"}
          </button>
        </div>

        {/* 3-Year Plan */}
        <div className="bg-cb-bg rounded-[30px] shadow-neu p-8 flex flex-col relative transform md:-translate-y-4 border-2 border-cb-primary">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cb-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Save 20%
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">3-Year Plan</h3>
            <p className="text-gray-500 text-sm">Upfront commitment value.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹60,000 <span className="text-lg font-bold text-gray-400 mb-1 ml-1">total</span>
            </div>
            <p className="text-sm text-green-600 font-bold mt-2 border border-green-200 bg-green-50 rounded px-2 py-1 inline-block">
              Only ₹20,000 / year equivalent
            </p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Secure current pricing
            </li>
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Priority Support
            </li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_DODO_PLAN_3_YEAR_ID || '')}
            disabled={loadingPlan !== null}
            className="w-full py-4 bg-cb-primary rounded-xl shadow-md text-white font-bold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200"
          >
            {loadingPlan === process.env.NEXT_PUBLIC_DODO_PLAN_3_YEAR_ID ? "Processing..." : "Select 3 Years"}
          </button>
        </div>

        {/* 5-Year Plan */}
        <div className="bg-cb-bg rounded-[30px] shadow-neu p-8 flex flex-col hover:-translate-y-1 transition-transform duration-300 relative">
          <div className="absolute -top-4 right-8 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Save 28%
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">5-Year Plan</h3>
            <p className="text-gray-500 text-sm">Maximum duration tier.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹90,000 <span className="text-lg font-bold text-gray-400 mb-1 ml-1">total</span>
            </div>
            <p className="text-sm text-amber-600 font-bold mt-2 border border-amber-200 bg-amber-50 rounded px-2 py-1 inline-block">
              Only ₹18,000 / year equivalent
            </p>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Maximize savings
            </li>
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> VIP Dedicated Support
            </li>
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> All Future Updates
            </li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_DODO_PLAN_5_YEAR_ID || '')}
            disabled={loadingPlan !== null}
            className="w-full py-4 bg-cb-bg rounded-xl shadow-neu text-gray-600 font-bold hover:shadow-neu-pressed active:shadow-neu-pressed transition-all duration-200"
          >
            {loadingPlan === process.env.NEXT_PUBLIC_DODO_PLAN_5_YEAR_ID ? "Processing..." : "Select 5 Years"}
          </button>
        </div>

      </div>
    </div>
  );
}
