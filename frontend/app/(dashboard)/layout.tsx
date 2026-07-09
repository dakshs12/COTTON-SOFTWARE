"use client";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { subscription } = useAuth();
  const router = useRouter();

  const status = subscription?.status || 'ACTIVE';
  const daysRemaining = subscription?.days_remaining || 0;
  const planType = subscription?.plan_type || '1_YEAR';

  if (status === 'LOCKED_OUT') {
    return (
      <div className="min-h-screen bg-cb-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-cb-bg rounded-[30px] shadow-neu p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 mx-auto bg-cb-bg rounded-full shadow-neu flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-playfair">Access Paused</h2>
          <p className="text-gray-600 mb-8">
            {planType === 'TRIAL' 
              ? "Your 14-day free trial has ended. Please select a plan to unlock your workspace."
              : "Your subscription has expired. Please select a renewal plan below to resume operations."}
          </p>
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-4 bg-cb-bg rounded-xl shadow-neu text-blue-600 font-bold hover:shadow-neu-pressed transition-all duration-200"
          >
            View Plans & Renew
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {status === 'READ_ONLY_GRACE' && (
        <div 
          className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-2 text-amber-800 shadow-sm z-50 fixed top-0"
          style={{ left: "var(--cb-sidebar-width)", width: "calc(100% - var(--cb-sidebar-width))" }}
        >
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">
            Your subscription has ended. CottBook is in read-only mode for {7 + daysRemaining} more days before total lockout.
          </span>
          <button onClick={() => router.push('/subscription')} className="ml-4 font-bold underline cursor-pointer">Renew Now</button>
        </div>
      )}
      
      {status === 'EXPIRING_WARNING' && (
        <div 
          className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-center gap-2 text-blue-800 z-50 fixed top-0"
          style={{ left: "var(--cb-sidebar-width)", width: "calc(100% - var(--cb-sidebar-width))" }}
        >
          <span className="font-medium">
            {planType === 'TRIAL'
              ? `Your free trial ends in ${daysRemaining} days. Upgrade your plan to prevent service interruption.`
              : `Your subscription expires in ${daysRemaining} days. Renew your license early to secure seamless billing.`}
          </span>
          <button onClick={() => router.push('/subscription')} className="ml-4 font-bold underline cursor-pointer">
            {planType === 'TRIAL' ? 'Upgrade' : 'Renew'}
          </button>
        </div>
      )}

      {/* Sidebar — fixed left, light neumorphic */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <main
        className="flex-1 p-8 print:m-0 print:p-0"
        style={{ 
          marginLeft: "var(--cb-sidebar-width)",
          marginTop: (status === 'READ_ONLY_GRACE' || status === 'EXPIRING_WARNING') ? "48px" : "0px"
        }}
      >
        {children}
      </main>
    </>
  );
}
