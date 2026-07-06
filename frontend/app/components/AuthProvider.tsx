"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../../lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasChecked = useRef(false);

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");

  const checkAuth = async (): Promise<boolean> => {
    try {
      await api.get("firms/");
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("auth/logout/");
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    hasChecked.current = false;
    router.push("/login");
  };

  // Only run auth check ONCE on mount, not on every pathname change
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const initAuth = async () => {
      if (isAuthPage) {
        // On login/register, just stop loading and show the form
        setLoading(false);
        return;
      }

      // On protected pages, verify the cookie
      const authed = await checkAuth();
      setLoading(false);
      if (!authed) {
        router.push("/login");
      }
    };

    initAuth();
  }, []);

  const [sessionExpired, setSessionExpired] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState("");

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    setReauthError("");
    setReauthLoading(true);
    try {
      const username = localStorage.getItem('last_username');
      if (!username) {
        throw new Error("Session lost. Please log in again.");
      }
      await api.post("token/", { username, password: reauthPassword });
      setSessionExpired(false);
      setReauthPassword("");
    } catch (err: any) {
      setReauthError(err.response?.data?.detail || err.message || "Invalid password.");
    } finally {
      setReauthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cb-bg text-gray-500 font-bold text-xl">
        Loading CottBook...
      </div>
    );
  }

  // Guard: block protected content if not authenticated (but allow auth pages)
  if (!isAuthenticated && !isAuthPage) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth, logout }}>
      {children}
      
      {sessionExpired && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-cb-bg p-8 rounded-[30px] shadow-neu max-w-md w-full animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-playfair font-bold text-gray-800 mb-2">Session Paused</h2>
            <p className="text-sm text-gray-600 mb-6 font-sans">
              Your session has paused for security. Please re-enter your password to continue.
            </p>
            
            <form onSubmit={handleReauth} className="space-y-4">
              <div>
                <input
                  type="password"
                  className="w-full bg-cb-bg rounded-xl px-4 py-3 shadow-neu-inner text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              
              {reauthError && (
                <div className="text-red-500 text-sm px-2 font-medium">
                  {reauthError}
                </div>
              )}
              
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSessionExpired(false);
                    logout();
                  }}
                  className="flex-1 py-3 bg-cb-bg rounded-xl shadow-neu text-gray-600 font-bold hover:shadow-neu-pressed active:shadow-neu-pressed transition-all duration-200"
                >
                  Log Out
                </button>
                <button
                  type="submit"
                  disabled={reauthLoading}
                  className="flex-1 py-3 bg-cb-bg rounded-xl shadow-neu text-blue-600 font-bold hover:shadow-neu-pressed active:shadow-neu-pressed transition-all duration-200 disabled:opacity-50"
                >
                  {reauthLoading ? "Verifying..." : "Resume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
