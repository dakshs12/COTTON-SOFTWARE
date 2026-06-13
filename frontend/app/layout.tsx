import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Quicksand } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} ${quicksand.variable} min-h-screen flex`}
        suppressHydrationWarning
      >
        {/* Sidebar — fixed left, light neumorphic */}
        <Sidebar />

        {/* Main content area — offset by sidebar width */}
        <main
          className="flex-1 p-8 print:m-0 print:p-0"
          style={{ marginLeft: "var(--cb-sidebar-width)" }}
        >
          {children}
        </main>

        {/* Agentation visual feedback tool (development only) */}
        <div className="print:hidden">
          {process.env.NODE_ENV === "development" && <Agentation />}
        </div>
      </body>
    </html>
  );
}