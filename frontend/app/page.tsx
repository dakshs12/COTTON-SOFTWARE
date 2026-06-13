"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Briefcase, Package, Activity, IndianRupee } from 'lucide-react';

interface DashboardData {
  kpi: {
    total_deals: number;
    total_bales: number;
    total_pending_bales: number;
    total_brokerage: number;
  };
  top_buyers: { buyer__company_name: string; total_bales: number }[];
  top_sellers: { seller__company_name: string; total_bales: number }[];
  revenue_trends: { month: string; revenue: number }[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [partyDues, setPartyDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/analytics/dashboard/'),
      axios.get('http://127.0.0.1:8000/api/brokerage/party-dues/')
    ])
      .then(([analyticsRes, duesRes]) => {
        setData(analyticsRes.data);
        setPartyDues(duesRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto neu-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Dashboard</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Welcome back, Broker. Here is your business overview.
          </p>
        </div>
      </div>
      
      {loading ? (
        <p className="text-base" style={{ color: "var(--cb-text-label)" }}>
          Loading analytics...
        </p>
      ) : !data ? (
        <p className="text-base" style={{ color: "var(--cb-danger)" }}>
          Failed to load dashboard data.
        </p>
      ) : (
        <div className="space-y-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* KPI 1 */}
            <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>Total Deals</span>
                <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
                  <Briefcase size={20} style={{ color: "var(--cb-primary)" }} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                  {data.kpi.total_deals}
                </h3>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>Total Bales</span>
                <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
                  <Package size={20} style={{ color: "var(--cb-secondary)" }} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                  {data.kpi.total_bales.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>


            {/* KPI 4 */}
            <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>Total Brokerage</span>
                <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
                  <IndianRupee size={20} style={{ color: "var(--cb-success)" }} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                  {formatCurrency(data.kpi.total_brokerage)}
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--cb-text-label)" }}>Gross Expected</p>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue Trend */}
            <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
              <h3 className="text-lg font-bold mb-6" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                Brokerage Revenue Trend
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--cb-primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--cb-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cb-divider)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--cb-text-label)" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--cb-text-label)" }} tickFormatter={(value) => `₹${value / 1000}k`} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--cb-shadow-md)", background: "var(--cb-bg)" }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--cb-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Buyers */}
            <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
              <h3 className="text-lg font-bold mb-6" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                Top Buyers by Volume (Bales)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_buyers} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--cb-divider)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="buyer__company_name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "var(--cb-text-heading)", fontWeight: 600 }} 
                      width={140}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: "transparent" }}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--cb-shadow-md)", background: "var(--cb-bg)" }}
                      formatter={(value: number) => [`${value.toLocaleString('en-IN')} Bales`, "Volume"]}
                    />
                    <Bar dataKey="total_bales" fill="var(--cb-secondary)" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Third Row: Outstanding Dues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Outstanding Dues */}
            <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                  Outstanding Dues
                </h3>
                <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>
              <div className="space-y-4">
                {partyDues.slice(0, 5).map((party, i) => (
                  <div key={party.party_id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{party.company_name}</h4>
                        <p className="text-xs text-gray-500">{party.bill_count} Unpaid Bills</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-500 block">
                        ₹ {party.balance_due.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
                {partyDues.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No outstanding dues! 🎉</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}