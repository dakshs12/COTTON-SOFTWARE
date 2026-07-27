"use client";

import React, { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { Shield, Zap, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Script from "next/script";
import api from "@/lib/api";

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

      {/* Pricing Tier Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        onMouseLeave={() => setHoveredPlan('3_YEAR')}
      >

        {/* 1-Year Plan */}
        <div
          className={`rounded-[30px] p-8 flex flex-col transition-all duration-300 ${hoveredPlan === '1_YEAR'
            ? 'border-2 border-blue-500 bg-white shadow-lg -translate-y-1'
            : 'border-2 border-slate-200 bg-white/50'
            }`}
          onMouseEnter={() => setHoveredPlan('1_YEAR')}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">1-Year Plan</h3>
            <p className="text-gray-500 text-sm">Standard core baseline.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹ xxxbase1 <span className="text-lg font-bold text-gray-400 mb-1 ml-1">/yr</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-gray-600 font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Full Suite Access
            </li>
          </ul>
          <button
            onClick={() => setContactModalOpen(true)}
            className={`w-full py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 ${hoveredPlan === '1_YEAR'
              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md'
              : 'bg-transparent text-blue-600 border-2 border-blue-500'
              }`}
          >
            Contact to Subscribe
          </button>
        </div>

        {/* 3-Year Plan */}
        <div
          className={`rounded-[30px] p-8 flex flex-col relative transition-all duration-300 ${hoveredPlan === '3_YEAR'
            ? 'border-2 border-blue-500 bg-white shadow-lg -translate-y-1'
            : 'border-2 border-slate-200 bg-white/50'
            }`}
          onMouseEnter={() => setHoveredPlan('3_YEAR')}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cb-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Save 20%
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">3-Year Plan</h3>
            <p className="text-gray-500 text-sm">Upfront commitment value.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹ xxbase2 <span className="text-lg font-bold text-gray-400 mb-1 ml-1">total</span>
            </div>
            <p className="text-sm text-green-600 font-bold mt-2 border border-green-200 bg-green-50 rounded px-2 py-1 inline-block">
              Only ₹0 / year equivalent
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
            onClick={() => setContactModalOpen(true)}
            className={`w-full py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 ${hoveredPlan === '3_YEAR'
              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md'
              : 'bg-transparent text-blue-600 border-2 border-blue-500'
              }`}
          >
            Contact to Subscribe
          </button>
        </div>

        {/* 5-Year Plan */}
        <div
          className={`rounded-[30px] p-8 flex flex-col relative transition-all duration-300 ${hoveredPlan === '5_YEAR'
            ? 'border-2 border-blue-500 bg-white shadow-lg -translate-y-1'
            : 'border-2 border-slate-200 bg-white/50'
            }`}
          onMouseEnter={() => setHoveredPlan('5_YEAR')}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Save 28%
          </div>
          <div className="mb-6 mt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">5-Year Plan</h3>
            <p className="text-gray-500 text-sm">Maximum duration tier.</p>
          </div>
          <div className="mb-8">
            <div className="text-4xl font-black text-cb-primary flex items-end">
              ₹ xbase3 <span className="text-lg font-bold text-gray-400 mb-1 ml-1">total</span>
            </div>
            <p className="text-sm text-amber-600 font-bold mt-2 border border-amber-200 bg-amber-50 rounded px-2 py-1 inline-block">
              Only ₹0 / year equivalent
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
            onClick={() => setContactModalOpen(true)}
            className={`w-full py-4 rounded-xl font-bold cursor-pointer transition-all duration-300 ${hoveredPlan === '5_YEAR'
              ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md'
              : 'bg-transparent text-blue-600 border-2 border-blue-500'
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
