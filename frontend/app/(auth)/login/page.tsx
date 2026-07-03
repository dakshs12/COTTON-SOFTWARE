"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";
import api from "../../../lib/api";
import { GoogleLogin } from '@react-oauth/google';
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
    <div className="w-full max-w-md p-8 bg-cb-bg rounded-[30px] shadow-neu animate-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-playfair font-bold text-gray-800 tracking-tight flex items-center justify-center gap-3">
          <img src="/favicon.png" alt="CottBook Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          CottBook
        </h1>
        <p className="text-sm text-gray-500 font-sans mt-2">Brokerage Management System</p>
      </div>

      {!needsCompany ? (
        <>
          <form onSubmit={handleSubmit(onLogin)} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-2">Username / Email</label>
              <input
                {...register("username")}
                type="text"
                autoComplete="new-password" 
                className="neu-input"
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-red-500 text-xs px-2 mt-1">{errors.username.message}</p>}
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
              className="w-full neu-btn neu-btn-primary mt-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Login"}
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
              onError={() => setError("Google Sign-In failed.")}
              useOneTap
              theme="outline"
              shape="pill"
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 font-sans">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Register Firm
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
