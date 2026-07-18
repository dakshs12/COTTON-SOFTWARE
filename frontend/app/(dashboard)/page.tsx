"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Briefcase, Package, Truck, AlertCircle, Edit3, Clock } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  kpi: {
    total_bales_ytd: number;
    total_deals_label: string;
    total_bales: number;
    pending_passing: number;
    pending_dispatches: number;
    unbilled_info: {
      count: number;
      oldest_date: string | null;
      is_6_months_plus: boolean;
    };
    fulfillment_progress: number;
    current_month_name: string;
  };
  top_buyers: any[];
  top_sellers: any[];
  bales_trends: any[];
  recent_bargains: any[];
}

interface PartyDue {
  party_id: number;
  company_name: string;
  balance_due: number;
  bill_count: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dues, setDues] = useState<PartyDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [notepadText, setNotepadText] = useState("");
  const [todos, setTodos] = useState<{id: string, text: string, done: boolean}[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [activeTab, setActiveTab] = useState<'notepad' | 'checklist'>('checklist');
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Start Clock
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    const fetchData = async () => {
      try {
        const [dashRes, duesRes] = await Promise.all([
          api.get("analytics/dashboard/"),
          api.get("brokerage/party-dues/")
        ]);
        setData(dashRes.data);
        setDues(duesRes.data);
        
        // Load Notepad and Todos from local storage
        const savedNotes = localStorage.getItem("brokerNotepad");
        if (savedNotes) setNotepadText(savedNotes);
        
        const savedTodos = localStorage.getItem("brokerTodos");
        if (savedTodos) setTodos(JSON.parse(savedTodos));

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => clearInterval(timer);
  }, []);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotepadText(e.target.value);
    localStorage.setItem("brokerNotepad", e.target.value);
  };

  const addTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.trim()) {
      const updatedTodos = [...todos, { id: Date.now().toString(), text: newTodo.trim(), done: false }];
      setTodos(updatedTodos);
      localStorage.setItem("brokerTodos", JSON.stringify(updatedTodos));
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTodos(updatedTodos);
    localStorage.setItem("brokerTodos", JSON.stringify(updatedTodos));
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(t => t.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem("brokerTodos", JSON.stringify(updatedTodos));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-gray-500 font-bold text-xl animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-800 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 font-sans mt-1">Track your recent deals, bales, and daily dispatches.</p>
        </div>
        
        {/* Live Clock Widget */}
        {time && (
          <div className="neu-card px-5 py-3 flex items-center gap-4 mt-4 md:mt-0" style={{ borderRadius: "16px" }}>
            <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
              <Clock size={24} style={{ color: "var(--cb-secondary)" }} />
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-quicksand)" }}>
                {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </h2>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-quicksand)" }}>
                {time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1: Total Bales YTD */}
        <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>
              Total Bales <span className="lowercase normal-case font-medium text-xs ml-1 opacity-70">({data.kpi.total_deals_label})</span>
            </span>
            <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
              <Briefcase size={20} style={{ color: "var(--cb-primary)" }} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
              {data.kpi.total_bales_ytd.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* KPI 2: Total Bales */}
        <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>Total Bales in {data.kpi.current_month_name}</span>
            <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
              <Package size={20} style={{ color: "var(--cb-secondary)" }} />
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                {data.kpi.total_bales.toLocaleString('en-IN')}
              </h3>
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">{data.kpi.fulfillment_progress}%</span>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Fulfilled</p>
              </div>
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 shadow-inner">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, data.kpi.fulfillment_progress)}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Passing */}
        <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>Pending Passing</span>
            <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
              <AlertCircle size={20} style={{ color: "var(--cb-warning)" }} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
              {data.kpi.pending_passing?.toLocaleString('en-IN') || 0}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--cb-text-label)" }}>Bales awaiting passing</p>
          </div>
        </div>

        {/* KPI 4: Pending Dispatches */}
        <div className="neu-card p-6 flex flex-col justify-between" style={{ borderRadius: "16px" }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold tracking-wider uppercase" style={{ color: "var(--cb-text-label)", fontFamily: "var(--font-quicksand)" }}>Pending Dispatches</span>
            <div className="p-2 rounded-full" style={{ background: "var(--cb-bg)", boxShadow: "var(--cb-shadow-sm)" }}>
              <Truck size={20} style={{ color: "var(--cb-warning)" }} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
              {data.kpi.pending_dispatches.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--cb-text-label)" }}>Bales awaiting dispatch</p>
          </div>
        </div>
      </div>

      {/* Grid Layout 8 / 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Bales Volume Trend */}
          <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
              Bales Volume Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.bales_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--cb-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--cb-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cb-divider)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--cb-text-label)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--cb-text-label)" }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--cb-shadow-md)", background: "var(--cb-bg)" }}
                    formatter={(value: number) => [`${value.toLocaleString('en-IN')} Bales`, "Volume"]}
                  />
                  <Area type="monotone" dataKey="volume" stroke="var(--cb-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Bargains */}
          <div className="neu-card overflow-hidden" style={{ borderRadius: "16px" }}>
            <div className="p-6 pb-4 border-b" style={{ borderColor: "var(--cb-divider)" }}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                  Recent Bargains
                </h3>
                <Link href="/transaction/bargain" className="text-sm font-bold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
            </div>
            
            {data.recent_bargains.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-sans">No recent bargains.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer / Mill</th>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">Seller / Ginner</th>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_bargains.map((deal, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors" style={{ borderColor: "var(--cb-divider)" }}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">{deal.date}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{deal.buyer}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{deal.seller}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-700 text-right whitespace-nowrap">
                          {deal.bales.toLocaleString('en-IN')} Bales
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Outstanding Dues */}
          <div className="neu-card overflow-hidden" style={{ borderRadius: "16px" }}>
            <div className="p-6 pb-4 border-b" style={{ borderColor: "var(--cb-divider)" }}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-red-600" style={{ fontFamily: "var(--font-playfair-display)" }}>
                  Action Required: Outstanding Dues
                </h3>
              </div>
              <p className="text-sm text-gray-500 font-sans mt-1">Parties with pending payments on brokerage bills.</p>
            </div>
            
            {dues.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-sans">
                No outstanding dues. All accounts clear!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">Party Name</th>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Unpaid Bills</th>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Balance Due</th>
                      <th className="px-6 py-4 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.map((due) => (
                      <tr key={due.party_id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors" style={{ borderColor: "var(--cb-divider)" }}>
                        <td className="px-6 py-4 font-bold text-gray-800">{due.company_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {due.bill_count} Bills
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          {formatCurrency(due.balance_due)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/reports/due-list`} className="text-sm font-bold text-blue-600 hover:underline">
                            Collect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN (Span 4) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Broker Notepad */}
          <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
            <div className="flex items-center gap-2 mb-4">
              <Edit3 size={20} style={{ color: "var(--cb-secondary)" }} />
              <h3 className="text-lg font-bold" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
                Broker Notepad
              </h3>
            </div>
            <div className="flex gap-2 bg-cb-bg rounded-xl p-1 shadow-neu-inner mb-4">
              <button 
                onClick={() => setActiveTab('notepad')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'notepad' ? 'text-gray-700 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Notepad
              </button>
              <button 
                onClick={() => setActiveTab('checklist')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'checklist' ? 'text-gray-700 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Checklist
              </button>
            </div>
            
            {activeTab === 'notepad' ? (
              <textarea
                className="w-full h-48 bg-cb-bg rounded-xl p-4 shadow-neu-inner text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-sans text-sm resize-none"
                placeholder="Jot down quick reminders, rates, or follow-ups here. It saves automatically..."
                value={notepadText}
                onChange={handleNoteChange}
              />
            ) : (
              <div className="h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                <input
                  type="text"
                  placeholder="Add new task and press Enter..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={addTodo}
                  className="w-full bg-cb-bg rounded-lg px-3 py-2 text-sm shadow-neu-inner focus:outline-none focus:ring-1 focus:ring-blue-500/30 mb-3"
                />
                <div className="space-y-2">
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-center justify-between group">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input 
                          type="checkbox" 
                          checked={todo.done}
                          onChange={() => toggleTodo(todo.id)}
                          className="rounded text-blue-500 focus:ring-0 border-gray-300 w-4 h-4 cursor-pointer"
                        />
                        <span className={`text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {todo.text}
                        </span>
                      </label>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity cursor-pointer p-1"
                        title="Delete task"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Buyers */}
          <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
              Top Buyers
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_buyers} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--cb-divider)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="buyer__company_name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "var(--cb-text-heading)", fontWeight: 600 }} 
                    width={100}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--cb-shadow-md)", background: "var(--cb-bg)" }}
                    formatter={(value: number) => [`${value.toLocaleString('en-IN')} Bales`, "Volume"]}
                  />
                  <Bar dataKey="total_bales" fill="var(--cb-secondary)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Sellers */}
          <div className="neu-card p-6" style={{ borderRadius: "16px" }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: "var(--cb-text-heading)", fontFamily: "var(--font-playfair-display)" }}>
              Top Sellers
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_sellers} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--cb-divider)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="seller__company_name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "var(--cb-text-heading)", fontWeight: 600 }} 
                    width={100}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--cb-shadow-md)", background: "var(--cb-bg)" }}
                    formatter={(value: number) => [`${value.toLocaleString('en-IN')} Bales`, "Volume"]}
                  />
                  <Bar dataKey="total_bales" fill="var(--cb-primary)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}