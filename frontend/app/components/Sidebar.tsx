"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  Truck, 
  BarChart3, 
  LogOut,
  ReceiptIndianRupee,
  Clock,
  ClipboardList
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { 
    title: 'MASTER',
    items: [
      { name: 'Firm Master', path: '/master/firm', icon: Building2 },
      { name: 'Party Master', path: '/master/party', icon: Users },
    ]
  },
  {
    title: 'TRANSACTION',
    items: [
      { name: 'Bargain Entry', path: '/transaction/bargain', icon: FileText },
      { name: 'Passing Entry', path: '/transaction/passing', icon: CheckCircle },
      { name: 'Delivery Details', path: '/transaction/delivery', icon: Truck },
    ]
  },
  {
    title: "BROKERAGE",
    items: [
      { name: "Bill Generation", path: "/brokerage/bill-generation", icon: ReceiptIndianRupee },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { name: 'Bills Statement', path: '/reports/bills-statement', icon: ClipboardList },
      { name: "Due List", path: "/reports/due-list", icon: Clock },
      { name: 'Analytics', path: '/reports/analytics', icon: BarChart3 },
    ]
  }
];

import { useAuth } from './AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div
      className="fixed left-0 top-0 h-screen overflow-y-auto flex flex-col z-50 print:hidden"
      style={{
        width: "var(--cb-sidebar-width)",
        background: "var(--cb-bg)",
        borderRight: "1px solid var(--cb-divider)",
        boxShadow: "4px 0 12px rgba(188, 195, 207, 0.25)",
      }}
    >
      {/* ── Brand Header ── */}
      <div
        className="px-7 py-6"
        style={{ borderBottom: "1px solid var(--cb-divider)" }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-playfair-display), 'Playfair Display', serif",
            color: "var(--cb-primary)",
          }}
        >
          CottBook
        </h1>
        <p
          className="text-xs mt-1 font-medium"
          style={{
            fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
            color: "var(--cb-text-label)",
          }}
        >
          Brokerage Management
        </p>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 py-5 space-y-5">
        {menuItems.map((section: any, index) => (
          <div key={index}>
            {/* Section Title */}
            {section.title && (
              <h3
                className="text-xs font-bold uppercase tracking-widest mb-2.5 px-3"
                style={{
                  fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
                  color: "var(--cb-text-placeholder)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                }}
              >
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items ? (
                section.items.map((item: any) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      className="flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-sm font-medium"
                      style={{
                        borderRadius: "var(--cb-radius-sm)",
                        color: isActive ? "var(--cb-primary)" : "var(--cb-text-body)",
                        background: "var(--cb-bg)",
                        boxShadow: isActive ? "var(--cb-pressed-sm)" : "none",
                        fontWeight: isActive ? 700 : 500,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#dde3eb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--cb-bg)";
                      }}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                      {item.name}
                    </Link>
                  );
                })
              ) : (
                // Single item (Dashboard)
                <Link 
                  href={section.path || '/'}
                  className="flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-sm font-medium"
                  style={{
                    borderRadius: "var(--cb-radius-sm)",
                    color: pathname === section.path ? "var(--cb-primary)" : "var(--cb-text-body)",
                    background: "var(--cb-bg)",
                    boxShadow: pathname === section.path ? "var(--cb-pressed-sm)" : "none",
                    fontWeight: pathname === section.path ? 700 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== section.path) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#dde3eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--cb-bg)";
                  }}
                >
                  <section.icon size={18} strokeWidth={pathname === section.path ? 2.5 : 1.8} />
                  {section.name}
                </Link>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        className="px-4 py-4"
        style={{ borderTop: "1px solid var(--cb-divider)" }}
      >
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-200 text-sm font-medium cursor-pointer"
          style={{
            borderRadius: "var(--cb-radius-sm)",
            color: "var(--cb-danger)",
            background: "var(--cb-bg)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "#f5e0e0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--cb-bg)";
          }}
        >
          <LogOut size={18} strokeWidth={1.8} />
          Exit Software
        </button>
      </div>
    </div>
  );
}