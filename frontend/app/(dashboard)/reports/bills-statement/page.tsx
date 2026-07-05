"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Search, Printer, Download, ChevronDown, Check, FileText } from 'lucide-react';
import CustomDatePicker from '@/app/components/CustomDatePicker';
import * as XLSX from 'xlsx';

export default function BillsStatementPage() {
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [parties, setParties] = useState<any[]>([]);
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [selectedPartyId, setSelectedPartyId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Search Party Dropdown
  const [isFirmDropdownOpen, setIsFirmDropdownOpen] = useState(false);

  // Search Party Dropdown
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [partySearchTerm, setPartySearchTerm] = useState("");

  // Statement Data
  const [statementData, setStatementData] = useState<any>(null);
  const [fetchingStatement, setFetchingStatement] = useState(false);

  useEffect(() => {
    fetchParties();
    fetchFirms();
    
    // Set default dates (Start of FY to Today)
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    const fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    
    setStartDate(`${fyStartYear}-04-01`);
    
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setEndDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const fetchFirms = async () => {
    try {
      const res = await api.get('firms/');
      setFirms(res.data);
      if (res.data.length > 0) {
        setSelectedFirmId(res.data[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await api.get('parties/');
      setParties(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching parties:", error);
      setLoading(false);
    }
  };

  const fetchStatement = async () => {
    if (!selectedPartyId) {
      showToast("Please select a Party first.", 'error');
      return;
    }
    
    setFetchingStatement(true);
    try {
      // Convert DD-MM-YYYY to YYYY-MM-DD for API if needed, but our API uses whatever format, wait Django expects YYYY-MM-DD.
      const formatForApi = (dateStr: string) => {
        if (!dateStr) return "";
        if (dateStr.includes('/')) return dateStr;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) return dateStr; // already YYYY
          return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY -> YYYY-MM-DD
        }
        return dateStr;
      };

      const apiStart = formatForApi(startDate);
      const apiEnd = formatForApi(endDate);
      
      let url = `statement/${selectedPartyId}/?`;
      if (apiStart) url += `start_date=${apiStart}&`;
      if (apiEnd) url += `end_date=${apiEnd}`;

      const res = await api.get(url);
      setStatementData(res.data);
    } catch (error) {
      console.error("Error fetching statement:", error);
      showToast("Error fetching statement data.", 'error');
    } finally {
      setFetchingStatement(false);
    }
  };

  const filteredParties = useMemo(() => {
    return parties.filter(p => p.company_name.toLowerCase().includes(partySearchTerm.toLowerCase()));
  }, [parties, partySearchTerm]);

  const selectedParty = parties.find(p => p.id.toString() === selectedPartyId);
  const selectedFirm = firms.find(f => f.id.toString() === selectedFirmId);

  // --- Printing Logic ---
  const handlePrint = () => {
    window.print();
  };

  // --- Excel Export Logic ---
  const handleExportExcel = () => {
    if (!statementData || !statementData.transactions) return;

    // Build the sheet data as an Array of Arrays
    const aoa: any[][] = [];

    // Header Rows
    aoa.push([selectedFirm ? selectedFirm.firm_name : "Account Statement"]);
    aoa.push(["Account Statement"]);
    aoa.push([`Statement For: ${statementData.party.company_name} (${statementData.party.station})`]);
    aoa.push([`From: ${formatDateForDisplay(startDate)}`, "", `To: ${formatDateForDisplay(endDate)}`]);
    aoa.push([]); // blank row

    // Table Headers
    aoa.push(["Date", "Particulars", "Debit (₹)", "Credit (₹)", "Balance (₹)"]);

    // Transactions
    statementData.transactions.forEach((tx: any) => {
      aoa.push([
        formatDateForDisplay(tx.date),
        tx.type === 'Bill' ? `Brokerage Bill #${tx.ref_no}` : tx.particulars,
        tx.debit > 0 ? tx.debit : "",
        tx.credit > 0 ? tx.credit : "",
        tx.balance
      ]);
    });

    // Total Row
    aoa.push([
      "CLOSING BALANCE",
      "",
      totalDebit > 0 ? totalDebit : "",
      totalCredit > 0 ? totalCredit : "",
      statementData.closing_balance
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Merge cells for the headers to look clean
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Firm Name
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Account Statement
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Party Name
    ];
    
    // Auto-size columns loosely
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 45 }, // Particulars
      { wch: 15 }, // Debit
      { wch: 15 }, // Credit
      { wch: 15 }  // Balance
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Account Statement");

    const fileName = `Statement_${statementData.party.company_name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Helper to format date for display
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Calculate totals for UI
  const totalDebit = statementData?.transactions.reduce((sum: number, tx: any) => sum + tx.debit, 0) || 0;
  const totalCredit = statementData?.transactions.reduce((sum: number, tx: any) => sum + tx.credit, 0) || 0;

  if (loading) {
    return <div className="p-8 text-center" style={{ color: "var(--cb-text-secondary)" }}>Loading Bills Statement module...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 print:m-0 print:p-0">
      
      {/* --- HEADER (Hidden in Print) --- */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair-display), serif", color: "var(--cb-text-heading)" }}>
            Bills Statement
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--cb-text-secondary)" }}>
            Generate and export ledger statements for your parties.
          </p>
        </div>
        {statementData && (
          <div className="flex gap-4">
            <button className="neu-btn" onClick={handleExportExcel}>
              <Download size={18} /> Export Excel
            </button>
            <button className="neu-btn neu-btn-primary" onClick={handlePrint}>
              <Printer size={18} /> Print PDF
            </button>
          </div>
        )}
      </div>

      {/* --- FILTERS (Hidden in Print) --- */}
      <div className="neu-card p-4 sm:p-6 print:hidden">
        <h3 className="font-bold mb-4" style={{ color: "var(--cb-text-heading)" }}>Report Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          
          <div className="relative">
            <label className="neu-label">Select Firm</label>
            <button 
              type="button"
              className="neu-input w-full text-left flex justify-between items-center"
              onClick={() => setIsFirmDropdownOpen(!isFirmDropdownOpen)}
            >
              <span className="truncate">{selectedFirm ? selectedFirm.firm_name : "Select Firm..."}</span>
              <ChevronDown size={18} style={{ color: "var(--cb-primary)" }} />
            </button>
            {isFirmDropdownOpen && (
              <ul className="neu-dropdown z-50 p-2 max-h-60 overflow-y-auto w-64">
                {firms.map((f) => (
                  <li 
                    key={f.id} 
                    className="px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => {
                      setSelectedFirmId(f.id.toString());
                      setIsFirmDropdownOpen(false);
                    }}
                  >
                    <span className="truncate">{f.firm_name}</span>
                    {selectedFirmId === f.id.toString() && <Check size={16} style={{ color: "var(--cb-primary)" }}/>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="md:col-span-2 relative">
            <label className="neu-label">Select Party</label>
            <button 
              type="button"
              className="neu-input w-full text-left flex justify-between items-center"
              onClick={() => setIsPartyDropdownOpen(!isPartyDropdownOpen)}
            >
              <span className="truncate">{selectedParty ? `${selectedParty.company_name} - ${selectedParty.station}` : "Search Party..."}</span>
              <ChevronDown size={18} style={{ color: "var(--cb-primary)" }} />
            </button>
            {isPartyDropdownOpen && (
              <div className="neu-dropdown z-50 p-2">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="neu-input w-full mb-2"
                  value={partySearchTerm}
                  onChange={(e) => setPartySearchTerm(e.target.value)}
                  autoFocus
                />
                <ul className="max-h-60 overflow-y-auto">
                  {filteredParties.map((p) => (
                    <li 
                      key={p.id} 
                      className="px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-50 flex justify-between items-center"
                      onClick={() => {
                        setSelectedPartyId(p.id.toString());
                        setIsPartyDropdownOpen(false);
                      }}
                    >
                      <span>{p.company_name} <span className="text-xs text-gray-500">({p.station})</span></span>
                      {selectedPartyId === p.id.toString() && <Check size={16} style={{ color: "var(--cb-primary)" }}/>}
                    </li>
                  ))}
                  {filteredParties.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No parties found.</li>}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="neu-label">From Date</label>
            <CustomDatePicker value={startDate} onChange={setStartDate} placeholder="DD-MM-YYYY" />
          </div>
          <div>
            <label className="neu-label">To Date</label>
            <CustomDatePicker value={endDate} onChange={setEndDate} placeholder="DD-MM-YYYY" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            className="neu-btn" 
            style={{ color: "var(--cb-primary)" }}
            onClick={fetchStatement}
            disabled={fetchingStatement}
          >
            {fetchingStatement ? "Loading..." : "Generate Statement"}
          </button>
        </div>
      </div>

      {/* --- STATEMENT PREVIEW & PRINT LAYOUT --- */}
      {statementData && (
        <div className="neu-card p-8 print:shadow-none print:border-none print:p-12 print:mx-auto print:max-w-[210mm] bg-white">
          
          {/* Print Header */}
          <div className="text-center mb-8 pb-6" style={{ borderBottom: "2px solid var(--cb-divider)" }}>
            {selectedFirm && (
              <div className="mb-4">
                <h1 className="text-2xl font-bold" style={{ color: "var(--cb-text-heading)" }}>{selectedFirm.firm_name}</h1>
                <p className="text-sm" style={{ color: "var(--cb-text-secondary)" }}>{selectedFirm.address}, {selectedFirm.city} - {selectedFirm.pincode}</p>
                <p className="text-sm" style={{ color: "var(--cb-text-secondary)" }}>GST: {selectedFirm.gst_no} | PAN: {selectedFirm.pan_no}</p>
              </div>
            )}
            <h2 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-playfair-display), serif", color: "var(--cb-text-heading)" }}>
              Account Statement
            </h2>
            <p className="text-sm font-medium" style={{ color: "var(--cb-text-secondary)" }}>
              From: <span className="font-bold text-gray-800">{formatDateForDisplay(startDate)}</span> &nbsp;&nbsp;|&nbsp;&nbsp; To: <span className="font-bold text-gray-800">{formatDateForDisplay(endDate)}</span>
            </p>
          </div>

          {/* Party Details */}
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: "var(--cb-text-label)" }}>Statement For:</h3>
            <p className="text-xl font-bold" style={{ color: "var(--cb-text-heading)" }}>{statementData.party.company_name}</p>
            <p className="text-sm" style={{ color: "var(--cb-text-secondary)" }}>Station: {statementData.party.station}</p>
          </div>

          {/* Summary Cards (Visible on Screen, hidden on Print if desired, but good for Print too) */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl" style={{ background: "var(--cb-bg)", border: "1px solid var(--cb-divider)" }}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Billed</p>
              <p className="text-xl font-bold" style={{ color: "var(--cb-text-heading)" }}>₹ {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "var(--cb-bg)", border: "1px solid var(--cb-divider)" }}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-xl font-bold text-green-600">₹ {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(107, 142, 35, 0.1)", border: "1px solid rgba(107, 142, 35, 0.2)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--cb-primary)" }}>Outstanding Balance</p>
              <p className="text-xl font-bold" style={{ color: "var(--cb-primary)" }}>₹ {statementData.closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Statement Table */}
          <table className="w-full text-left border-collapse" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cb-divider)" }}>
                <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Particulars</th>
                <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Debit (₹)</th>
                <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Credit (₹)</th>
                <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {statementData.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    No transactions found in this date range.
                  </td>
                </tr>
              ) : (
                statementData.transactions.map((tx: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--cb-divider)" }} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 text-sm text-gray-800 whitespace-nowrap">{formatDateForDisplay(tx.date)}</td>
                    <td className="py-3 px-2">
                      <p className="text-sm font-bold text-gray-800">{tx.type === 'Bill' ? `Brokerage Bill #${tx.ref_no}` : `Payment Received`}</p>
                      <p className="text-xs text-gray-500">{tx.particulars}</p>
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-800 text-right">
                      {tx.debit > 0 ? tx.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-green-600 text-right">
                      {tx.credit > 0 ? tx.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-gray-800 text-right">
                      {tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {statementData.transactions.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-4 px-2 text-sm font-bold text-gray-800 text-right uppercase">Closing Balance:</td>
                  <td className="py-4 px-2 text-sm font-bold text-gray-800 text-right">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-2 text-sm font-bold text-green-600 text-right">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-2 text-sm font-bold text-gray-900 text-right" style={{ color: "var(--cb-primary)" }}>
                    ₹ {statementData.closing_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          
          {/* Print Footer */}
          <div className="mt-16 text-center text-xs text-gray-400 hidden print:block">
            <p>This is a computer-generated statement.</p>
            <p>Generated by CottBook</p>
          </div>

        </div>
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
