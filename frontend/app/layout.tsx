import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Cotton Broker Software",
  description: "Manage bargains, passings, and deliveries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen text-slate-900 flex">
        {/* The Sidebar stays fixed on the left */}
        <Sidebar />
        
        {/* The 'children' is the actual page content (Dashboard, Party Form, etc.) */}
        {/* We add margin-left (ml-64) so the content doesn't get hidden behind the sidebar */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}