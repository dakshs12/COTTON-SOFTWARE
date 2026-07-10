"use client";
import { Toast } from '@/app/components/Toast';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../lib/api";
import { useAuth } from "../../components/AuthProvider";
import { GoogleLogin } from '@react-oauth/google';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Building2 } from "lucide-react";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").refine(s => !s.includes(' '), 'Username cannot contain spaces'),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const companySchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
});
type CompanyFormValues = z.infer<typeof companySchema>;

export default function RegisterPage() {
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  // OTP State
  const [step, setStep] = useState<1 | 2>(1);
  const [registrationData, setRegistrationData] = useState<RegisterFormValues | null>(null);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

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

  // Google Registration State
  const [needsCompany, setNeedsCompany] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      company_name: "",
      username: "",
      email: "",
      password: ""
    }
  });

  const { register: registerCompany, handleSubmit: handleSubmitCompany, formState: { errors: companyErrors } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  // Explicitly clear inputs on mount
  useEffect(() => {
    reset({ first_name: "", last_name: "", company_name: "", username: "", email: "", password: "" });
  }, [reset]);

  const onRegister = async (data: RegisterFormValues) => {
    setError("");
    setLoading(true);

    try {
      await api.post("auth/request-otp/", { email: data.email });
      setRegistrationData(data);
      setStep(2);
      setCountdown(60);
      showToast("Verification code sent to your email!", 'success');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !registrationData) return;
    setLoading(true);
    setError("");
    try {
      await api.post("auth/request-otp/", { email: registrationData.email });
      setCountdown(60);
      showToast("OTP resent successfully!", 'success');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    if (!registrationData) return;
    
    setError("");
    setLoading(true);
    try {
      await api.post("auth/verify-and-register/", {
        email: registrationData.email,
        otp_code: otpCode,
        company_name: registrationData.company_name,
        username: registrationData.username,
        password: registrationData.password,
        first_name: registrationData.first_name,
        last_name: registrationData.last_name
      });
      showToast("Registration successful! Please login.", 'success');
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("auth/google/", { token: credentialResponse.credential });
      
      if (res.status === 202) {
        // User needs to provide company name
        setGoogleUserData(res.data);
        setNeedsCompany(true);
      } else {
        // Already registered, just logged in!
        localStorage.setItem('last_username', res.data.email || 'google_user');
        const success = await checkAuth();
        if (success) {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Google Sign-Up failed.");
    } finally {
      setLoading(false);
    }
  };

  const onCompanySubmit = async (data: CompanyFormValues) => {
    setError("");
    setLoading(true);
    try {
      await api.post("auth/google/complete/", {
        email: googleUserData.email,
        first_name: googleUserData.first_name,
        last_name: googleUserData.last_name,
        company_name: data.company_name
      });
      
      localStorage.setItem('last_username', googleUserData.email);
      const success = await checkAuth();
      if (success) {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-cb-bg rounded-[30px] shadow-neu my-8 animate-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-playfair font-bold text-gray-800 tracking-tight flex items-center justify-center gap-3">
          <img src="/favicon.png" alt="CottBook Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          CottBook
        </h1>
        <p className="text-sm text-gray-500 font-sans mt-2">Start managing your brokerage today.</p>
      </div>

      {step === 1 && !needsCompany && (
        <>
          <form onSubmit={handleSubmit(onRegister)} className="space-y-5" autoComplete="off">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 px-2">First Name</label>
                <input
                  {...register("first_name")}
                  type="text"
                  autoComplete="off"
                  className="neu-input"
                  placeholder="John"
                />
                {errors.first_name && <p className="text-red-500 text-xs px-2 mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Last Name</label>
                <input
                  {...register("last_name")}
                  type="text"
                  autoComplete="off"
                  className="neu-input"
                  placeholder="Doe"
                />
                {errors.last_name && <p className="text-red-500 text-xs px-2 mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Firm / Company Name</label>
              <input
                {...register("company_name")}
                type="text"
                autoComplete="off"
                className="neu-input"
                placeholder="e.g. Daksh Cotton Brokers"
              />
              {errors.company_name && <p className="text-red-500 text-xs px-2 mt-1">{errors.company_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Username</label>
              <input
                {...register("username")}
                type="text"
                autoComplete="new-password"
                className="neu-input"
                placeholder="Choose a username"
              />
              {errors.username && <p className="text-red-500 text-xs px-2 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Email Address</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="off"
                className="neu-input"
                placeholder="broker@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs px-2 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="neu-input pl-4 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs px-2 mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="text-red-500 text-sm px-2 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full neu-btn neu-btn-primary mt-6 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">OR</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-Up failed.")}
              useOneTap
              theme="outline"
              shape="pill"
              text="signup_with"
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 font-sans">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Login here
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="font-medium text-slate-600 hover:text-slate-900 transition-colors underline-offset-2 hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-slate-600 hover:text-slate-900 transition-colors underline-offset-2 hover:underline">
              Privacy Policy
            </Link>.
          </div>
        </>
      )}

      {step === 2 && !needsCompany && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="font-bold text-gray-800 text-xl font-playfair mb-2">Check your email</h3>
            <p className="text-sm text-gray-500">
              We've sent a 6-digit verification code to <br />
              <span className="font-bold text-gray-700">{registrationData?.email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6 flex flex-col items-center">
            <div className="flex gap-3 justify-center mb-4">
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
                  className="neu-input w-12 h-14 text-center text-2xl font-bold rounded-xl text-gray-700"
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
              className="w-full neu-btn neu-btn-primary disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className={`text-sm font-bold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <button type="button" onClick={() => {setStep(1); setError('');}} className="hover:underline">
              Back to Registration
            </button>
          </div>
        </div>
      )}

      {needsCompany && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
            <Building2 className="text-blue-500 shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Welcome, {googleUserData.first_name}!</h3>
              <p className="text-xs text-gray-600 mt-1">
                Please provide your firm's name to complete your registration.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitCompany(onCompanySubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Firm / Company Name</label>
              <input
                {...registerCompany("company_name")}
                type="text"
                autoComplete="off"
                className="neu-input"
                placeholder="e.g. Daksh Cotton Brokers"
              />
              {companyErrors.company_name && <p className="text-red-500 text-xs px-2 mt-1">{companyErrors.company_name.message}</p>}
            </div>

            {error && (
              <div className="text-red-500 text-sm px-2 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full neu-btn neu-btn-primary mt-4 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
        </div>
      )}
      <Toast message={toastMessage} />
    </div>
  );
}
