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
      <div className="min-h-screen w-full bg-cb-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-cb-bg rounded-[30px] shadow-neu p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 mx-auto bg-cb-bg rounded-full shadow-neu flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-playfair">Access Paused</h2>
          <p className="text-gray-600 mb-8">
            Your 14-day free trial has ended. To upgrade your account and resume operations, please contact support to process your direct payment.
          </p>
          <div className="bg-cb-bg rounded-2xl shadow-neu-pressed p-6 mb-2 text-left space-y-3">
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">Support Contact</h3>
            <p className="text-sm font-medium text-gray-700">Name: Daksh Sethi</p>
            <p className="text-sm font-medium text-gray-700">Email: cottbook2026@gmail.com</p>
            <p className="text-sm font-medium text-gray-700">Phone / WhatsApp: +91 8269603271</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar — fixed left, light neumorphic */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div 
        className="flex-1 min-h-screen flex flex-col"
        style={{ marginLeft: "var(--cb-sidebar-width)" }}
      >
        {status === 'READ_ONLY_GRACE' && (
          <div className="bg-amber-100 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-amber-800 text-sm shadow-sm w-full">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">
              Your subscription has ended. CottBook is in read-only mode for {7 + daysRemaining} more days before total lockout.
            </span>
            <button onClick={() => router.push('/subscription')} className="ml-4 font-bold underline cursor-pointer">Renew Now</button>
          </div>
        )}
        
        {status === 'ACTIVE' && planType === 'TRIAL' && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-center gap-2 text-blue-800 text-sm w-full">
            <span className="font-medium">
              You are currently on a free trial with {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining. Upgrade your plan to unlock full access.
            </span>
            <button onClick={() => router.push('/subscription')} className="ml-4 font-bold underline cursor-pointer">
              Upgrade
            </button>
          </div>
        )}
        
        {status === 'EXPIRING_WARNING' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-amber-900 text-sm w-full">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="font-medium">
              {planType === 'TRIAL'
                ? `Your free trial ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Upgrade your plan to prevent service interruption.`
                : `Your subscription expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}. Renew your license early to secure seamless billing.`}
            </span>
            <button onClick={() => router.push('/subscription')} className="ml-4 font-bold underline cursor-pointer">
              {planType === 'TRIAL' ? 'Upgrade' : 'Renew'}
            </button>
          </div>
        )}

        <main className="flex-1 p-8 print:m-0 print:p-0">
          {children}
        </main>
      </div>
    </>
  );
}
