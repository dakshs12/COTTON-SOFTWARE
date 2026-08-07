"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";
import api from "../../../lib/api";
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import posthog from "posthog-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Building2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required").refine(s => !s.includes(' '), 'Username cannot contain spaces'),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const companySchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
});
type CompanyFormValues = z.infer<typeof companySchema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Google Registration State
  const [needsCompany, setNeedsCompany] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  
  const { checkAuth } = useAuth();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const { register: registerCompany, handleSubmit: handleSubmitCompany, formState: { errors: companyErrors } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  });

  // Explicitly clear inputs on mount to prevent aggressive back-button caching
  useEffect(() => {
    reset({ username: "", password: "" });
  }, [reset]);

  const onLogin = async (data: LoginFormValues) => {
    setError("");
    setLoading(true);

    try {
      await api.post("token/", { username: data.username, password: data.password });
      localStorage.setItem('last_username', data.username);
      
      const success = await checkAuth();
      if (success) {
        posthog.identify(data.username);
        posthog.capture("user_logged_in", { method: "password" });
        window.location.href = "/";
      } else {
        setError("Login succeeded but session could not be verified. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password.");
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
        // Fully logged in
        localStorage.setItem('last_username', res.data.email || 'google_user');
        const success = await checkAuth();
        if (success) {
          posthog.identify(res.data.email || 'google_user');
          posthog.capture("user_logged_in_google", { method: "google" });
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Google Sign-In failed.");
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
      <div className="w-full max-w-[420px] p-6 sm:p-8 md:p-10 bg-cb-bg rounded-[24px] sm:rounded-[32px] shadow-neu animate-in zoom-in-95 duration-500">
      <div className="text-center mb-5 sm:mb-8 flex flex-col items-center">
        <img src="/full-logo-main.svg" alt="CottBook Logo" className="w-56 sm:w-64 h-auto object-contain mb-1 sm:mb-2" />
      </div>

      {!needsCompany ? (
        <>
          <form onSubmit={handleSubmit(onLogin)} className="space-y-4 sm:space-y-5" autoComplete="off">
            <div>
              <label className="block text-[12px] sm:text-[13px] font-bold text-gray-700 mb-1 sm:mb-1.5 px-1">Username / Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input
                  {...register("username")}
                  type="text"
                  autoComplete="new-password" 
                  className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all text-[13px] sm:text-sm"
                  style={{ boxShadow: "var(--cb-pressed)", backgroundColor: "white", border: "none" }}
                  placeholder="Enter your email or username"
                />
              </div>
              {errors.username && <p className="text-red-500 text-[10px] sm:text-xs px-2 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-[12px] sm:text-[13px] font-bold text-gray-700 mb-1 sm:mb-1.5 px-1">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-11 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all text-[13px] sm:text-sm"
                  style={{ boxShadow: "var(--cb-pressed)", backgroundColor: "white", border: "none" }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] sm:text-xs px-2 mt-1">{errors.password.message}</p>}
              
              <div className="flex justify-end mt-1.5 sm:mt-2">
                <Link href="/forgot-password" className="text-[11px] sm:text-[12px] font-medium text-[#65a34e] hover:text-[#528a3f] transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs sm:text-sm px-2 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 bg-[#65a34e] hover:bg-[#599144] text-white rounded-lg sm:rounded-xl font-bold transition-colors disabled:opacity-50 mt-1 sm:mt-2 text-sm sm:text-base cursor-pointer"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-[10px] sm:text-xs text-gray-400 font-medium lowercase">or</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-center">
            <div className="w-full [&>div]:w-full [&>div>div]:w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed.")}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
                text="signin_with"
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 font-sans">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#65a34e] font-bold hover:underline">
              Sign up
            </Link>
          </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
            <Building2 className="text-blue-500 shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Almost there, {googleUserData.first_name}!</h3>
              <p className="text-xs text-gray-600 mt-1">
                Since this is your first time signing in, please provide your firm's name to complete setup.
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
                placeholder="e.g. CottonCorp Industries"
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
    </div>
  );
}
