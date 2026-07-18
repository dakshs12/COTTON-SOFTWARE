"use client";

import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { User, Mail, Phone, Hash, Shield, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("auth/me/");
      setProfile(res.data);
      setNewEmail(res.data.email);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // 1. Update basic info
      await api.post("auth/profile/update/", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        phone_number: profile.phone_number
      });

      // 2. Check if email changed
      if (newEmail !== profile.email) {
        // Trigger Email OTP flow
        await api.post("auth/profile/request-email-otp/", { new_email: newEmail });
        setShowOtpModal(true);
      } else {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyEmailOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return setOtpError("Please enter all 6 digits.");
    
    setOtpLoading(true);
    setOtpError("");
    
    try {
      await api.post("auth/profile/verify-email-otp/", {
        new_email: newEmail,
        otp_code: code
      });
      setShowOtpModal(false);
      setProfile({ ...profile, email: newEmail });
      setSuccess("Profile and email updated successfully!");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setOtpError(err.response?.data?.error || "Invalid verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading profile...</div>;
  }

  const emailChanged = newEmail !== profile?.email;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-gray-800 tracking-tight">Identity Workspace</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and account security.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100 flex items-center gap-3">
          <Shield className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 shadow-sm border border-green-100 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="bg-cb-bg p-8 rounded-[30px] shadow-neu">
        
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">First Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profile?.first_name || ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-cb-bg border border-gray-200 rounded-xl shadow-neu-inset text-gray-700 focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Last Name</label>
            <input
              type="text"
              value={profile?.last_name || ""}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              className="w-full px-4 py-3 bg-cb-bg border border-gray-200 rounded-xl shadow-neu-inset text-gray-700 focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Username</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={profile?.username || ""}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-cb-bg border border-gray-200 rounded-xl shadow-neu-inset text-gray-700 focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={profile?.phone_number || ""}
              onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-cb-bg border border-gray-200 rounded-xl shadow-neu-inset text-gray-700 focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all"
            />
          </div>
        </div>

        <hr className="border-gray-200 my-8 shadow-sm" />

        {/* Secure Email Pipeline */}
        <div className="mb-8 p-6 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-sm relative overflow-hidden">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Account Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-cb-bg border border-gray-200 rounded-xl shadow-neu-inset text-gray-700 focus:outline-none focus:ring-2 focus:ring-cb-primary/20 transition-all"
            />
          </div>
          {emailChanged && (
            <div className="mt-3 text-xs font-semibold text-amber-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
              <Shield className="w-3.5 h-3.5" />
              Altering account email requires verification. An OTP will be sent to the new address upon saving.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setProfile({ ...profile });
              fetchProfile(); // Re-fetch to reset
            }}
            disabled={saving}
            className="neu-btn neu-btn-cancel-action px-8 py-3.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="neu-btn neu-btn-action px-8 py-3.5"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-cb-bg rounded-[30px] shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cb-bg rounded-full shadow-neu flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-cb-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 font-playfair">Verify New Email</h3>
              <p className="text-sm text-gray-500 mt-2">
                Enter the 6-digit code sent to <br/><strong className="text-gray-700">{newEmail}</strong>
              </p>
            </div>

            {otpError && <p className="text-red-500 text-xs font-semibold text-center mb-4">{otpError}</p>}

            <div className="flex justify-center gap-2 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-cb-bg rounded-xl shadow-neu-inset text-gray-800 focus:outline-none focus:ring-2 focus:ring-cb-primary/30"
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowOtpModal(false)}
                className="neu-btn neu-btn-cancel-action flex-1 py-3"
              >
                Cancel
              </button>
              <button
                onClick={verifyEmailOtp}
                disabled={otpLoading}
                className="neu-btn neu-btn-action flex-1 py-3"
              >
                {otpLoading ? "..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
