"use client";
import { Toast } from '@/app/components/Toast';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { Eye, EyeOff, Key } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Step 1 State
  const [identifier, setIdentifier] = useState("");
  const [obfuscatedEmail, setObfuscatedEmail] = useState("");
  const [actualEmail, setActualEmail] = useState("");
  
  // Step 2 State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  
  // Step 3 State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Handle Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your username or email.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const res = await api.post("auth/forgot-password/request-otp/", { identifier });
      setActualEmail(res.data.email);
      setObfuscatedEmail(res.data.obfuscated_email);
      setStep(2);
      setCountdown(60);
      showToast("OTP sent successfully!", "success");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: OTP Inputs & Verification
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      await api.post("auth/forgot-password/verify-otp/", { email: actualEmail, otp_code: otpCode });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      await api.post("auth/forgot-password/reset/", {
        email: actualEmail,
        otp_code: otp.join(""),
        new_password: newPassword
      });
      showToast("Password reset successfully!", "success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError("");
    try {
      await api.post("auth/forgot-password/request-otp/", { identifier });
      setCountdown(60);
      showToast("OTP resent successfully!", 'success');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] p-6 sm:p-8 md:p-10 bg-cb-bg rounded-[24px] sm:rounded-[32px] shadow-neu animate-in zoom-in-95 duration-500 my-8">
      <Toast message={toastMessage} />
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
          <Key size={28} />
        </div>
        <h1 className="text-2xl font-playfair font-bold text-gray-800 tracking-tight">
          Forgot Password
        </h1>
      </div>

      {step === 1 && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter your username or email address and we'll send you a link to get back into your account.
          </p>
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Username or Email</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="neu-input" style={{ backgroundColor: "white" }}
                placeholder="broker@example.com"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm px-2 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 bg-[#65a34e] hover:bg-[#599144] text-white rounded-lg sm:rounded-xl font-bold transition-colors disabled:opacity-50 mt-4 sm:mt-6 text-sm sm:text-base cursor-pointer"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-bold">
            <Link href="/login" className="text-[#65a34e] font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              We've sent a 6-digit verification code to <br />
              <span className="font-bold text-gray-700">{obfuscatedEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6 flex flex-col items-center">
            <div className="flex gap-3 justify-center mb-4 w-full px-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="neu-input w-12 h-14 text-center text-2xl font-bold rounded-xl text-gray-700 p-0" style={{ backgroundColor: "white" }}
                />
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-sm px-2 font-medium text-center w-full">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-2.5 sm:py-3 px-4 bg-[#65a34e] hover:bg-[#599144] text-white rounded-lg sm:rounded-xl font-bold transition-colors disabled:opacity-50 mt-4 sm:mt-6 text-sm sm:text-base cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className={`text-sm font-bold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#65a34e] hover:underline'}`}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <p className="text-sm text-gray-500 text-center mb-6">
            Please enter your new password below.
          </p>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="neu-input pl-4 pr-12" style={{ backgroundColor: "white" }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="neu-input pl-4 pr-12" style={{ backgroundColor: "white" }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm px-2 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 bg-[#65a34e] hover:bg-[#599144] text-white rounded-lg sm:rounded-xl font-bold transition-colors disabled:opacity-50 mt-4 sm:mt-6 text-sm sm:text-base cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
