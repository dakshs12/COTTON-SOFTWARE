import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Quicksand } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CottBook — Brokerage Management",
  description: "Cotton brokerage platform for managing bargains, passings, deliveries, and invoicing.",
};

import { Agentation } from "agentation";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} ${quicksand.variable} min-h-screen flex text-gray-800 bg-cb-bg`}
        suppressHydrationWarning
      >
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>

        {/* Agentation visual feedback tool (development only) */}
        <div className="print:hidden">
          {process.env.NODE_ENV === "development" && <Agentation />}
        </div>
      </body>
    </html>
  );
}