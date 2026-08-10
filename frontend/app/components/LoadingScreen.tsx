"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cb-bg relative select-none animate-in fade-in duration-300">
      {/* Centered Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/full-logo-main.svg"
          alt="CottBook Logo"
          className="w-56 sm:w-64 h-auto object-contain"
        />
        
        {/* Sleek Animated Progress Bar */}
        <div className="mt-8 w-48 sm:w-64 h-1.5 bg-[#e2dfda] rounded-full overflow-hidden relative shadow-inner">
          <div
            className="animate-progress-indeterminate h-full rounded-full"
            style={{ backgroundColor: "var(--cb-secondary, #5a8f4a)" }}
          />
        </div>
      </div>
    </div>
  );
}
