"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  Truck, 
  LogOut,
  ReceiptIndianRupee,
  Clock,
  ClipboardList,
  User,
  CreditCard,
  BookOpen,
  Menu
} from 'lucide-react';
import { useAuth } from './AuthProvider';

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
      { name: "Party Report", path: "/reports/party-report", icon: BookOpen },
    ]
  }
];

// Flattened list for the mobile icon rail
const flatNavItems = menuItems.flatMap((section: any) => {
  if (section.items) return section.items;
  return [{ name: section.name, path: section.path || '/', icon: section.icon }];
});

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  return (
    <>
      {/* =========================================================================
          1. DESKTOP SIDEBAR (Visible on md: and above - 280px wide)
          Identical to original desktop layout with 0 regressions.
          ========================================================================= */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen overflow-y-auto flex-col z-40 print:hidden"
        style={{
          width: "var(--cb-sidebar-width)",
          background: "var(--cb-bg)",
          borderRight: "1px solid var(--cb-divider)",
          boxShadow: "4px 0 12px rgba(188, 195, 207, 0.25)",
        }}
      >
        {/* Brand Header */}
        <div
          className="px-4 py-6 sm:py-8 flex items-center justify-center shrink-0"
          style={{ borderBottom: "1px solid var(--cb-divider)", minHeight: "85px" }}
        >
          <img 
            src="/full-logo-main.svg" 
            alt="CottBook Brokerage Management" 
            className="w-48 sm:w-56 h-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-5">
          {menuItems.map((section: any, index) => (
            <div key={index}>
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

        {/* Footer */}
        <div
          className="px-4 py-4 space-y-1"
          style={{ borderTop: "1px solid var(--cb-divider)" }}
        >
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-200 text-sm cursor-pointer"
            style={{
              borderRadius: "var(--cb-radius-sm)",
              color: pathname === "/profile" ? "var(--cb-primary)" : "var(--cb-text-secondary)",
              background: "var(--cb-bg)",
              boxShadow: pathname === "/profile" ? "var(--cb-pressed-sm)" : "none",
              fontWeight: pathname === "/profile" ? 700 : 500,
            }}
            onMouseEnter={(e) => {
              if (pathname !== "/profile") {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#dde3eb";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--cb-bg)";
            }}
          >
            <User size={18} strokeWidth={pathname === "/profile" ? 2.5 : 1.8} />
            My Profile
          </Link>

          <Link
            href="/subscription"
            className="flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-200 text-sm cursor-pointer"
            style={{
              borderRadius: "var(--cb-radius-sm)",
              color: pathname === "/subscription" ? "var(--cb-primary)" : "var(--cb-text-secondary)",
              background: "var(--cb-bg)",
              boxShadow: pathname === "/subscription" ? "var(--cb-pressed-sm)" : "none",
              fontWeight: pathname === "/subscription" ? 700 : 500,
            }}
            onMouseEnter={(e) => {
              if (pathname !== "/subscription") {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#dde3eb";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--cb-bg)";
            }}
          >
            <CreditCard size={18} strokeWidth={pathname === "/subscription" ? 2.5 : 1.8} />
            Billing & Plans
          </Link>
          
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
            Log out
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE COLLAPSED ICON RAIL (Visible on mobile < md: - 56px wide)
          Shows top hamburger icon, vertically scrollable module icons, and quick actions.
          ========================================================================= */}
      <aside
        className="md:hidden fixed left-0 top-0 h-[100dvh] flex flex-col z-40 print:hidden"
        style={{
          width: "var(--cb-sidebar-collapsed-width)",
          background: "var(--cb-bg)",
          borderRight: "1px solid var(--cb-divider)",
          boxShadow: "2px 0 8px rgba(188, 195, 207, 0.2)",
        }}
      >
        {/* Top Hamburger Toggle Button */}
        <div
          className="h-[60px] flex items-center justify-center shrink-0"
          style={{ borderBottom: "1px solid var(--cb-divider)" }}
        >
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-cb-primary active:scale-95 transition-transform"
            style={{
              boxShadow: "var(--cb-raised-sm)",
              background: "var(--cb-bg)",
            }}
          >
            <Menu size={22} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Icon List */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col items-center gap-2">
          {flatNavItems.map((item: any) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={item.name}
                aria-label={item.name}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  color: isActive ? "var(--cb-primary)" : "var(--cb-text-body)",
                  background: "var(--cb-bg)",
                  boxShadow: isActive ? "var(--cb-pressed-sm)" : "none",
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile, Billing & Logout Icons */}
        <div
          className="py-3 flex flex-col items-center gap-2 shrink-0"
          style={{ borderTop: "1px solid var(--cb-divider)" }}
        >
          <Link
            href="/profile"
            title="My Profile"
            aria-label="My Profile"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              color: pathname === "/profile" ? "var(--cb-primary)" : "var(--cb-text-secondary)",
              background: "var(--cb-bg)",
              boxShadow: pathname === "/profile" ? "var(--cb-pressed-sm)" : "none",
            }}
          >
            <User size={19} strokeWidth={pathname === "/profile" ? 2.5 : 1.8} />
          </Link>

          <Link
            href="/subscription"
            title="Billing & Plans"
            aria-label="Billing & Plans"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              color: pathname === "/subscription" ? "var(--cb-primary)" : "var(--cb-text-secondary)",
              background: "var(--cb-bg)",
              boxShadow: pathname === "/subscription" ? "var(--cb-pressed-sm)" : "none",
            }}
          >
            <CreditCard size={19} strokeWidth={pathname === "/subscription" ? 2.5 : 1.8} />
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 active:bg-red-100"
            style={{
              color: "var(--cb-danger)",
              background: "var(--cb-bg)",
            }}
          >
            <LogOut size={19} strokeWidth={1.8} />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          3. MOBILE FULL DRAWER OVERLAY (Always rendered for 60fps smooth CSS slide)
          ========================================================================= */}
      {/* Backdrop — smooth fade, tap right side to close */}
      <div
        className={`md:hidden fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 transition-opacity duration-300 ease-out print:hidden ${
          isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Sheet — smooth iOS-grade cubic-bezier slide in/out */}
      <div
        className={`md:hidden fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] h-full max-h-[100dvh] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] print:hidden ${
          isMobileDrawerOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        }`}
        style={{
          background: "var(--cb-bg)",
          borderRight: "1px solid var(--cb-divider)",
        }}
      >
        {/* Header: Centered Logo (increased size by ~1-2px, perfectly centered) */}
        <div
          className="px-4 py-5 flex items-center justify-center shrink-0 w-full"
          style={{ borderBottom: "1px solid var(--cb-divider)", minHeight: "72px" }}
        >
          <img 
            src="/full-logo-main.svg" 
            alt="CottBook Brokerage Management" 
            className="w-[174px] h-auto object-contain mx-auto"
          />
        </div>

        {/* Scrollable Navigation + Bottom Actions in natural block flow */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-5"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            paddingBottom: "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))"
          }}
        >
          <nav className="space-y-4">
            {menuItems.map((section: any, index) => (
              <div key={index}>
                {section.title && (
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-2 px-3"
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
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-sm font-medium"
                          style={{
                            borderRadius: "var(--cb-radius-sm)",
                            color: isActive ? "var(--cb-primary)" : "var(--cb-text-body)",
                            background: "var(--cb-bg)",
                            boxShadow: isActive ? "var(--cb-pressed-sm)" : "none",
                            fontWeight: isActive ? 700 : 500,
                          }}
                        >
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                          {item.name}
                        </Link>
                      );
                    })
                  ) : (
                    <Link 
                      href={section.path || '/'}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-sm font-medium"
                      style={{
                        borderRadius: "var(--cb-radius-sm)",
                        color: pathname === section.path ? "var(--cb-primary)" : "var(--cb-text-body)",
                        background: "var(--cb-bg)",
                        boxShadow: pathname === section.path ? "var(--cb-pressed-sm)" : "none",
                        fontWeight: pathname === section.path ? 700 : 500,
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

          {/* Divider */}
          <div 
            className="my-3" 
            style={{ borderTop: "1px solid var(--cb-divider)" }} 
          />

          {/* Bottom Account Controls — scrolls smoothly in natural flow */}
          <div className="space-y-1 pt-1">
            <Link
              href="/profile"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-200 text-sm cursor-pointer"
              style={{
                borderRadius: "var(--cb-radius-sm)",
                color: pathname === "/profile" ? "var(--cb-primary)" : "var(--cb-text-secondary)",
                background: "var(--cb-bg)",
                boxShadow: pathname === "/profile" ? "var(--cb-pressed-sm)" : "none",
                fontWeight: pathname === "/profile" ? 700 : 500,
              }}
            >
              <User size={18} strokeWidth={pathname === "/profile" ? 2.5 : 1.8} />
              My Profile
            </Link>

            <Link
              href="/subscription"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-200 text-sm cursor-pointer"
              style={{
                borderRadius: "var(--cb-radius-sm)",
                color: pathname === "/subscription" ? "var(--cb-primary)" : "var(--cb-text-secondary)",
                background: "var(--cb-bg)",
                boxShadow: pathname === "/subscription" ? "var(--cb-pressed-sm)" : "none",
                fontWeight: pathname === "/subscription" ? 700 : 500,
              }}
            >
              <CreditCard size={18} strokeWidth={pathname === "/subscription" ? 2.5 : 1.8} />
              Billing & Plans
            </Link>
            
            <button
              type="button"
              onClick={() => {
                setIsMobileDrawerOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-3 py-2.5 w-full transition-all duration-200 text-sm font-medium cursor-pointer"
              style={{
                borderRadius: "var(--cb-radius-sm)",
                color: "var(--cb-danger)",
                background: "var(--cb-bg)",
              }}
            >
              <LogOut size={18} strokeWidth={1.8} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}