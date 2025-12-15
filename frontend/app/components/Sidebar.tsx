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
  ClipboardList, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { 
    title: 'MASTER',
    items: [
      { name: 'Party Master', path: '/master/party', icon: Users },
      { name: 'Firm Master', path: '/master/firm', icon: Building2 },
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
    title: 'REPORTS',
    items: [
      { name: 'Ledgers & Lists', path: '/reports/party', icon: ClipboardList },
      { name: 'Analytics', path: '/reports/analytics', icon: BarChart3 },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Header / Logo Area */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">CottonSoft</h1>
        <p className="text-xs text-slate-400 mt-1">Broker Management v1.0</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6">
        {menuItems.map((section: any, index) => (
          <div key={index}>
            {/* Section Title (e.g. MASTER, TRANSACTION) */}
            {section.title && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items ? (
                // If it has sub-items (like Master -> Party)
                section.items.map((item: any) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </Link>
                  );
                })
              ) : (
                // If it is a single item (like Dashboard)
                <Link 
                  href={section.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    pathname === section.path 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <section.icon size={18} />
                  {section.name}
                </Link>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Exit Button */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-900/20 w-full rounded-lg transition-colors text-sm font-medium">
          <LogOut size={18} />
          Exit Software
        </button>
      </div>
    </div>
  );
}