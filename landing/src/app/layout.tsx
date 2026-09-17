import type { Metadata, Viewport } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#2D5A27",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cottbook.com"),
  title: "CottBook | Software for Cotton Brokers & Commission Agents",
  description:
    "The modern digital operating system for Indian cotton brokers. Turn verbal saudas into official branded PDF contract notes, track quality passings & split dispatches, and automate your brokerage invoicing in seconds.",
  keywords: [
    "Cotton Broker Software",
    "Cotton Sauda Software",
    "Bargain Entry",
    "Indian Cotton Mandi",
    "Cotton Brokerage Accounting",
    "Cotton Commission Agent",
    "Shankar-6 Cotton",
    "Cotton Passing Register",
    "Cotton Bale Dispatch",
    "CottBook",
  ],
  authors: [{ name: "Daksh Sethi" }],
  creator: "Daksh Sethi",
  publisher: "CottBook",
  icons: {
    icon: "/favicon-logo.svg",
    shortcut: "/favicon-logo.svg",
    apple: "/favicon-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cottbook.com",
    siteName: "CottBook",
    title: "CottBook — Software for Cotton Brokers & Commission Agents",
    description:
      "Stop managing cotton trades on traditional excel sheets. Turn verbal saudas into branded WhatsApp contract slips, track lot passings, audit bale balances, and automate brokerage GST billing.",
    images: [
      {
        url: "/full-logo-main.svg",
        width: 1200,
        height: 630,
        alt: "CottBook Cotton Broker Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CottBook — Software for Cotton Brokers",
    description:
      "Turn verbal saudas into branded PDF contract notes and automate your cotton brokerage in seconds.",
    images: ["/full-logo-main.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Agentation } from "agentation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${dmSans.variable} ${plusJakartaSans.variable} antialiased bg-[#F8FAF7] text-slate-900`}>
        {children}
        <div className="print:hidden">
          <Agentation />
        </div>
      </body>
    </html>
  );
}

