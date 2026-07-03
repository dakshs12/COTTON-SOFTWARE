"use client";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  // Google Registration State
  const [needsCompany, setNeedsCompany] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
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
    reset({ company_name: "", username: "", email: "", password: "" });
  }, [reset]);

  const onRegister = async (data: RegisterFormValues) => {
    setError("");
    setLoading(true);

    try {
      await api.post("auth/register/", data);
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Registration failed. Try again.");
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

      {!needsCompany ? (
        <>
          <form onSubmit={handleSubmit(onRegister)} className="space-y-5" autoComplete="off">
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
        </>
      ) : (
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
    </div>
  );
}
