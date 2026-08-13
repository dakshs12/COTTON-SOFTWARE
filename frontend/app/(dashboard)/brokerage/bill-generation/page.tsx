"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Printer, FileText, Check, ChevronDown } from 'lucide-react';
import CustomDatePicker from '@/app/components/CustomDatePicker';
import posthog from "posthog-js";

// Helper to convert number to words (Indian Format)
const numberToWords = (num: number): string => {
  if (!num) return "";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) + 'Only' : 'Only';
  return str;
};

// Helper to format date as DD-MM-YYYY
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  if (dateStr.includes('/')) return dateStr; // Already formatted or different format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // If it's YYYY-MM-DD
    if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    // If it's DD-MM-YYYY already
    if (parts[2].length === 4) return dateStr;
  }
  return dateStr;
};

export default function BillGenerationPage() {
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [loading, setLoading] = useState(true);
  
  // Master Data
  const [parties, setParties] = useState<any[]>([]);
  const [firms, setFirms] = useState<any[]>([]);
  
  // Transaction Data
  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // UI States for Custom Dropdowns
  const [partySearch, setPartySearch] = useState("");
  const [firmSearch, setFirmSearch] = useState("");
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [isFirmDropdownOpen, setIsFirmDropdownOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    bill_no: '',
    bill_date: new Date().toISOString().split('T')[0],
    party_id: '',
    firm_id: '',
    remarks: ''
  });

  // Calculation State
  const [totals, setTotals] = useState({
    total_bales: 0,
    rate: 60, // Default from your screenshot
    gross_amount: 0,
    gst_percent: 18,
    cgst: 0,
    sgst: 0,
    igst: 0,
    net_amount: 0,
    amount_in_words: ''
  });

  const [useLetterhead, setUseLetterhead] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [pRes, fRes] = await Promise.all([
        api.get('parties/'),
        api.get('firms/')
      ]);
      setParties(pRes.data);
      setFirms(fRes.data);
      
      // Auto-select first firm
      if (fRes.data.length > 0) {
        setFormData(prev => ({ ...prev, firm_id: fRes.data[0].id }));
        setFirmSearch(fRes.data[0].firm_name);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching masters:", error);
    }
  };

  const fetchPendingDeliveries = async (partyId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`brokerage/pending/?party_id=${partyId}`);
      setPendingDeliveries(res.data);
      setSelectedIds([]); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending:", error);
      setLoading(false);
    }
  };

  const handlePartySelect = (party: any) => {
    setFormData({ ...formData, party_id: party.id });
    setPartySearch(party.company_name);
    setIsPartyDropdownOpen(false);
    fetchPendingDeliveries(party.id);
  };

  const handleFirmSelect = (firm: any) => {
    setFormData({ ...formData, firm_id: firm.id });
    setFirmSearch(firm.firm_name);
    setIsFirmDropdownOpen(false);
  };

  const toggleDelivery = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingDeliveries.length) setSelectedIds([]);
    else setSelectedIds(pendingDeliveries.map(d => d.id));
  };

  // Calculation Effect
  useEffect(() => {
    const selectedItems = pendingDeliveries.filter(d => selectedIds.includes(d.id));
    const totalBales = selectedItems.reduce((sum, item) => sum + item.bales, 0);
    const gross = totalBales * totals.rate;

    // Tax Logic
    let cgst = 0, sgst = 0, igst = 0;
    const selectedParty = parties.find(p => p.id == formData.party_id);
    const selectedFirm = firms.find(f => f.id == formData.firm_id);
    const gstRate = Number(totals.gst_percent) || 0;

    if (selectedParty && selectedFirm) {
        const pState = selectedParty.state?.toLowerCase().trim();
        const fState = selectedFirm.state?.toLowerCase().trim();

        if (pState && fState && pState === fState) {
            cgst = (gross * (gstRate / 2)) / 100;
            sgst = (gross * (gstRate / 2)) / 100;
            igst = 0;
        } else {
            igst = (gross * gstRate) / 100;
            cgst = 0;
            sgst = 0;
        }
    } else {
        igst = (gross * gstRate) / 100;
        cgst = 0;
        sgst = 0;
    }

    const net = Math.round(gross + cgst + sgst + igst);
    
    setTotals(prev => ({
        ...prev,
        total_bales: totalBales,
        gross_amount: gross,
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        igst: parseFloat(igst.toFixed(2)),
        net_amount: net,
        amount_in_words: numberToWords(net)
    }));

  }, [selectedIds, totals.rate, totals.gst_percent, formData.party_id, formData.firm_id]);

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return showToast("Please select deliveries.", 'error');
    if (!formData.bill_no) return showToast("Enter Bill No.", 'error');

    // FIX 400 ERROR: Clean Payload
    const payload = {
        ...formData,
        delivery_ids: selectedIds,
        total_bales: totals.total_bales,
        rate: Number(totals.rate), // Ensure Number
        gross_amount: Number(totals.gross_amount),
        gst_percent: Number(totals.gst_percent),
        cgst_amount: Number(totals.cgst),
        sgst_amount: Number(totals.sgst),
        igst_amount: Number(totals.igst),
        net_amount: Number(totals.net_amount),
        amount_in_words: totals.amount_in_words
    };
      
    try {
      await api.post('brokerage/generate/', payload);
      posthog.capture("brokerage_bill_generated", {
        total_bales: totals.total_bales,
        gross_amount: totals.gross_amount,
        net_amount: totals.net_amount,
        gst_percent: totals.gst_percent,
        delivery_count: selectedIds.length,
      });
      showToast("Bill Generated Successfully!", 'success');
      fetchPendingDeliveries(formData.party_id);
      setFormData(prev => ({ ...prev, bill_no: '' }));
      // Optionally trigger print here automatically
    } catch (error: any) {
      console.error("Generation failed:", error);
      showToast("Error: " + JSON.stringify(error.response?.data || error.message), 'error');
    }
  };

  const selectedPartyObj = parties.find(p => p.id == formData.party_id);
  const selectedFirmObj = firms.find(f => f.id == formData.firm_id);
  const selectedDeliveryItems = pendingDeliveries.filter(d => selectedIds.includes(d.id));

  const isFirmMatched = firms.some(f => f.firm_name === firmSearch);
  const filteredFirms = firms.filter(f => isFirmMatched ? true : f.firm_name.toLowerCase().includes(firmSearch.toLowerCase()));

  const isPartyMatched = parties.some(p => p.company_name === partySearch);
  const filteredParties = parties.filter(p => isPartyMatched ? true : p.company_name.toLowerCase().includes(partySearch.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto neu-fade-in pb-20 print:max-w-none print:w-full print:m-0 print:p-0">
      
      {/* SCREEN VIEW (HIDDEN ON PRINT) */}
      <div className="print:hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="neu-page-title text-3xl">Brokerage Bill</h1>
              <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>Generate commission invoices.</p>
            </div>
            <button onClick={() => window.print()} className="neu-btn text-[#04294E] !border !border-[#65a34e] hover:!bg-[#65a34e] hover:!text-white transition-all duration-300 flex items-center gap-2">
              <Printer size={18} /> Print Bill
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="neu-card p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--cb-text-heading)" }}>
                      <FileText size={18} style={{ color: "var(--cb-primary)" }}/> Bill Details
                    </h3>
                    <div className="space-y-4">
                        
                        {/* Smart Dropdown for Firm */}
                        <div className="relative">
                            <label className="neu-label">Your Firm</label>
                            <input 
                                value={firmSearch} 
                                onChange={(e) => { setFirmSearch(e.target.value); setIsFirmDropdownOpen(true); }}
                                onFocus={() => setIsFirmDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsFirmDropdownOpen(false), 200)}
                                className="neu-input font-medium cursor-pointer pr-10"
                                placeholder="Select Firm..." 
                            />
                            <ChevronDown size={16} className="absolute right-3 top-9 pointer-events-none" style={{ color: "var(--cb-text-label)" }}/>
                            {isFirmDropdownOpen && (
                                <ul className="neu-dropdown">
                                    {filteredFirms.map(f => (
                                        <li key={f.id} onMouseDown={() => handleFirmSelect(f)}>
                                            {f.firm_name}
                                            {formData.firm_id == f.id && <Check size={14} style={{ color: "var(--cb-primary)" }}/>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Smart Dropdown for Party */}
                        <div className="relative">
                            <label className="neu-label">Bill To (Party)</label>
                            <input 
                                value={partySearch} 
                                onChange={(e) => { setPartySearch(e.target.value); setIsPartyDropdownOpen(true); }}
                                onFocus={() => setIsPartyDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsPartyDropdownOpen(false), 200)}
                                className="neu-input font-bold cursor-pointer pr-10"
                                style={{ color: "var(--cb-text-heading)" }}
                                placeholder="Search Party..." 
                            />
                            <ChevronDown size={16} className="absolute right-3 top-9 pointer-events-none" style={{ color: "var(--cb-text-label)" }}/>
                            {isPartyDropdownOpen && (
                                <ul className="neu-dropdown">
                                    {filteredParties.map(p => (
                                        <li key={p.id} onMouseDown={() => handlePartySelect(p)}>
                                            <div>
                                              <span className="font-bold">{p.company_name}</span>
                                              <span className="text-xs block" style={{ color: "var(--cb-text-placeholder)" }}>{p.station}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="neu-label">Bill No</label>
                                <input value={formData.bill_no} onChange={(e) => setFormData({...formData, bill_no: e.target.value})} className="neu-input font-mono font-bold" placeholder="e.g. 001" />
                            </div>
                            <div>
                                <CustomDatePicker label="Bill Date" value={formData.bill_date} onChange={(val) => setFormData({...formData, bill_date: val})} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <input 
                              type="checkbox" 
                              id="useLetterhead" 
                              checked={useLetterhead} 
                              onChange={(e) => setUseLetterhead(e.target.checked)} 
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="useLetterhead" className="neu-label mb-0 cursor-pointer text-[1.1rem] font-bold" style={{ marginTop: '2px' }}>Use Letterhead</label>
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="neu-card p-6">
                    <h3 className="font-bold mb-4" style={{ color: "var(--cb-text-heading)" }}>Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--cb-divider)" }}>
                            <span className="font-bold" style={{ color: "var(--cb-text-body)" }}>Brokerage Rate (₹)</span>
                            <input
                              type="number"
                              value={totals.rate}
                              onChange={(e) => setTotals({...totals, rate: parseFloat(e.target.value) || 0})}
                              className="neu-input w-24 text-right font-mono"
                              style={{ padding: "0.3rem 0.5rem" }}
                            />
                        </div>
                        <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--cb-divider)" }}>
                            <span className="font-bold" style={{ color: "var(--cb-text-body)" }}>GST (%)</span>
                            <input
                              type="number"
                              value={totals.gst_percent}
                              onChange={(e) => setTotals({...totals, gst_percent: parseFloat(e.target.value) || 0})}
                              className="neu-input w-24 text-right font-mono"
                              style={{ padding: "0.3rem 0.5rem" }}
                            />
                        </div>
                        <div className="flex justify-between font-bold text-lg" style={{ color: "var(--cb-text-heading)" }}>
                            <span>Gross Amount</span><span>₹{totals.gross_amount.toLocaleString()}</span>
                        </div>
                        {totals.igst > 0 ? (
                            <div className="flex justify-between font-medium" style={{ color: "var(--cb-warning)" }}>
                              <span>IGST ({totals.gst_percent}%)</span><span>₹{totals.igst}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between font-medium" style={{ color: "var(--cb-primary)" }}>
                                  <span>CGST ({totals.gst_percent / 2}%)</span><span>₹{totals.cgst}</span>
                                </div>
                                <div className="flex justify-between font-medium" style={{ color: "var(--cb-primary)" }}>
                                  <span>SGST ({totals.gst_percent / 2}%)</span><span>₹{totals.sgst}</span>
                                </div>
                            </>
                        )}
                        <div className="pt-4 flex justify-between items-center" style={{ borderTop: "2px solid var(--cb-divider)" }}>
                            <span className="font-black text-xl" style={{ color: "var(--cb-text-heading)" }}>NET TOTAL</span>
                            <span className="font-black text-2xl" style={{ color: "var(--cb-secondary)" }}>₹{totals.net_amount.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={handleGenerate}
                          disabled={selectedIds.length === 0}
                          className="neu-btn text-[#04294E] !border !border-[#65a34e] enabled:hover:!bg-[#65a34e] enabled:hover:!text-white transition-all duration-300 w-full mt-4 py-3 disabled:cursor-not-allowed disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            <Save size={20} /> Generate & Save Bill
                        </button>
                    </div>
                </div>
            </div>

            {/* Unbilled Deals Table */}
            <div className="lg:col-span-2 neu-card overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--cb-divider)" }}>
                    <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Unbilled Deals</h3>
                    <span
                      className="neu-chip text-xs"
                      style={{ color: "var(--cb-warning)" }}
                    >
                      {pendingDeliveries.length} Unbilled
                    </span>
                </div>
                <div className="overflow-y-auto flex-1">
                    <table className="neu-table">
                        <thead>
                            <tr>
                                <th style={{ width: "40px" }}>
                                  <input
                                    type="checkbox"
                                    onChange={toggleSelectAll}
                                    checked={selectedIds.length > 0 && selectedIds.length === pendingDeliveries.length}
                                    className="w-4 h-4 rounded cursor-pointer accent-[#4a7fc4]"
                                  />
                                </th>
                                <th>Date</th>
                                <th>Truck No</th>
                                <th>Deal No</th>
                                <th>Counter Party</th>
                                <th className="text-right">Bales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                              <tr><td colSpan={6} className="text-center py-10" style={{ color: "var(--cb-text-label)" }}>Loading...</td></tr>
                            ) : pendingDeliveries.map((item) => (
                                <tr
                                  key={item.id}
                                  className="cursor-pointer"
                                  style={{
                                    backgroundColor: selectedIds.includes(item.id) ? "rgba(74, 127, 196, 0.06)" : "transparent",
                                  }}
                                  onClick={() => toggleDelivery(item.id)}
                                >
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        readOnly
                                        className="w-4 h-4 rounded cursor-pointer accent-[#4a7fc4]"
                                      />
                                    </td>
                                    <td>{item.date}</td>
                                    <td className="font-mono font-medium" style={{ color: "var(--cb-text-heading)" }}>{item.truck_no}</td>
                                    <td className="font-bold" style={{ color: "var(--cb-primary)" }}>{item.deal_no}</td>
                                    <td className="truncate max-w-[150px]">
                                      <span className="font-bold" style={{ color: "var(--cb-text-body)" }}>{item.counter_party}</span>
                                    </td>
                                    <td className="text-right font-mono font-bold">{item.bales}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
      </div>

      {/* --- REAL PRINT TEMPLATE (Matches Image 2 Exactly) --- */}
      <div className="hidden print:block font-sans text-black bg-white">
          
          {/* Watermark for all pages */}
          <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center gap-2 text-[10pt] font-bold text-gray-500 z-50" style={{ fontFamily: "var(--font-quicksand)" }}>
             <FileText size={14} /> CottBook &bull; Software for Cotton Brokers
          </div>

          <div className="w-full mx-auto min-h-[260mm] px-8 pt-8 pb-12 relative bg-transparent flex flex-col z-10 box-border" style={{ fontFamily: "Arial, sans-serif" }}>
              
              <div className="flex-1 pb-8">
                  {/* Header / Letterhead Area */}
                  <div className="mb-8">
                  {useLetterhead && selectedFirmObj?.letterhead ? (
                      <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                          <div>
                              <h1 className="text-2xl font-bold uppercase tracking-wide">{selectedFirmObj?.firm_name || "YOUR FIRM NAME"}</h1>
                              {selectedFirmObj?.tagline && <p className="font-bold text-sm">{selectedFirmObj.tagline}</p>}
                              <p className="text-sm">{selectedFirmObj?.address}</p>
                              <p className="text-sm">{selectedFirmObj?.city}{selectedFirmObj?.pincode ? ` - ${selectedFirmObj.pincode}` : ''}, {selectedFirmObj?.state}</p>
                              <p className="text-sm">Email: {selectedFirmObj?.email || "-"}</p>
                              <p className="text-sm">Ph: {[selectedFirmObj?.tele_o, selectedFirmObj?.mobile].filter(Boolean).join(" / ") || "-"}</p>
                              <p className="text-sm font-bold mt-1">CIN: {selectedFirmObj?.cin_no || "-"}</p>
                              <p className="text-sm font-bold">GST: {selectedFirmObj?.gst_no}</p>
                              <p className="text-sm font-bold">PAN: {selectedFirmObj?.pan_no}</p>
                          </div>
                          <div>
                              <img src={selectedFirmObj.letterhead} alt="Letterhead" className="w-48 h-auto object-contain object-top" />
                          </div>
                      </div>
                  ) : useLetterhead && !selectedFirmObj?.letterhead ? (
                      /* Fallback generic letterhead if checked but no image uploaded */
                      <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                          <div>
                              <h1 className="text-2xl font-bold uppercase tracking-wide">{selectedFirmObj?.firm_name || "YOUR FIRM NAME"}</h1>
                              {selectedFirmObj?.tagline && <p className="font-bold text-sm">{selectedFirmObj.tagline}</p>}
                              <p className="text-sm">{selectedFirmObj?.address}</p>
                              <p className="text-sm">{selectedFirmObj?.city}{selectedFirmObj?.pincode ? ` - ${selectedFirmObj.pincode}` : ''}, {selectedFirmObj?.state}</p>
                              <p className="text-sm">Email: {selectedFirmObj?.email || "-"}</p>
                              <p className="text-sm">Ph: {[selectedFirmObj?.tele_o, selectedFirmObj?.mobile].filter(Boolean).join(" / ") || "-"}</p>
                              <p className="text-sm font-bold mt-1">CIN: {selectedFirmObj?.cin_no || "-"}</p>
                              <p className="text-sm font-bold">GST: {selectedFirmObj?.gst_no}</p>
                              <p className="text-sm font-bold">PAN: {selectedFirmObj?.pan_no}</p>
                          </div>
                      </div>
                  ) : (
                      /* Blank Space for Pre-Printed Letterhead Paper */
                      <div className="h-40 w-full"></div>
                  )}
              </div>

              {/* Bill Meta Data */}
              <div className="mb-6 leading-relaxed">
                  <p className="font-bold text-sm">To,</p>
                  <p className="font-bold text-base">M/s. {selectedPartyObj?.company_name || "-"}, {selectedPartyObj?.station || "-"}</p>
                  <p className="font-bold text-sm">(GST No.: {selectedPartyObj?.gst_no || "-"})</p>
                  
                  <div className="flex justify-between font-bold text-sm mt-1">
                      <p>Bill No.: {formData.bill_no || "-"}</p>
                      <p>Date: {formatDate(formData.bill_date)}</p>
                  </div>
              </div>

              {/* Table */}
              <table className="w-full mb-2" style={{ borderTop: "2px solid black", borderBottom: "1px dashed black", fontFamily: "'Courier New', monospace", fontSize: "11pt", tableLayout: "fixed" }}>
                  <thead>
                      <tr style={{ borderBottom: "1px solid black" }}>
                          <th className="py-2 text-left font-bold" style={{ width: "42%" }}>Name</th>
                          <th className="py-2 text-center font-bold" style={{ width: "15%" }}>Station</th>
                          <th className="py-2 text-center font-bold" style={{ width: "10%" }}>Bales</th>
                          <th className="py-2 text-center font-bold" style={{ width: "12%" }}>Lot No</th>
                          <th className="py-2 text-center font-bold" style={{ width: "12%" }}>Bill No</th>
                          <th className="py-2 text-right font-bold" style={{ width: "9%" }}>Rate</th>
                      </tr>
                  </thead>
                  <tbody>
                      {selectedDeliveryItems.map((item, idx) => (
                          <tr key={item.id}>
                              <td className="py-2 text-left pr-2">{item.counter_party}</td>
                              <td className="py-2 text-center">{item.station}</td>
                              <td className="py-2 text-center">{item.bales}</td>
                              <td className="py-2 text-center">{item.lot_no || "-"}</td>
                              <td className="py-2 text-center">{item.party_bill_no || "-"}</td>
                              <td className="py-2 text-right">{item.deal_rate}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              {/* Total Bales */}
              <table className="w-full mb-6" style={{ fontFamily: "'Courier New', monospace", fontSize: "11pt", borderBottom: "1px dashed #ccc" }}>
                  <tbody>
                      <tr>
                          <td style={{ width: "50%" }} className="py-2 text-right font-bold">Total Bales :</td>
                          <td style={{ width: "8%" }} className="py-2 text-center font-bold">{totals.total_bales}</td>
                          <td style={{ width: "42%" }}></td>
                      </tr>
                  </tbody>
              </table>

              {/* Calculations */}
              <table style={{ width: "100%", marginBottom: "20px" }}>
                  <tbody>
                      <tr>
                          <td style={{ width: "60%", verticalAlign: "top" }}>
                              <table style={{ width: "100%", fontSize: "11pt", fontFamily: "'Courier New', monospace", lineHeight: "2" }}>
                                  <tbody>
                                      <tr>
                                          <td>Brokerage @{totals.rate}/- Per Bale</td>
                                          <td className="text-right">Rs. {totals.gross_amount.toFixed(2)}</td>
                                      </tr>
                                      {totals.igst > 0 ? (
                                          <tr>
                                              <td>IGST @{totals.gst_percent}%</td>
                                              <td className="text-right">Rs. {totals.igst.toFixed(2)}</td>
                                          </tr>
                                      ) : (
                                          <>
                                              <tr>
                                                  <td>CGST @{totals.gst_percent / 2}%</td>
                                                  <td className="text-right">Rs. {totals.cgst.toFixed(2)}</td>
                                              </tr>
                                              <tr>
                                                  <td>SGST @{totals.gst_percent / 2}%</td>
                                                  <td className="text-right">Rs. {totals.sgst.toFixed(2)}</td>
                                              </tr>
                                          </>
                                      )}
                                      <tr><td colSpan={2} style={{ borderTop: "3px double black" }}></td></tr>
                                      <tr>
                                          <td className="font-bold">Total Amount :</td>
                                          <td className="text-right font-bold">Rs. {totals.net_amount.toFixed(2)}</td>
                                      </tr>
                                      <tr><td colSpan={2} style={{ borderTop: "3px double black" }}></td></tr>
                                      <tr>
                                          <td colSpan={2} className="font-bold pb-8">Total Amount in Words: {totals.amount_in_words}</td>
                                      </tr>
                                  </tbody>
                              </table>
                          </td>
                          <td style={{ width: "40%" }}></td>
                      </tr>
                  </tbody>
              </table>
              </div> {/* End flex-1 wrapper */}

              {/* Footer */}
              <div className="mt-auto flex justify-between items-start text-sm pt-4 relative z-10 bg-white" style={{ borderTop: "1px solid black" }}>
                  <div>
                      <p className="font-bold underline mb-1">Bank Details:</p>
                      <p className="font-bold">Bank: {selectedFirmObj?.bank_name}</p>
                      <p className="font-bold">Branch: {selectedFirmObj?.branch}</p>
                      <p className="font-bold">A/c No: {selectedFirmObj?.bank_ac_no}</p>
                      <p className="font-bold">IFSC: {selectedFirmObj?.ifsc_code}</p>
                      
                      <p className="mt-6">E & O.E (Subject to {selectedFirmObj?.jurisdiction ? selectedFirmObj.jurisdiction + " " : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}Jurisdiction)</p>
                  </div>
                  <div className="text-right">
                      <p className="font-bold">For: {selectedFirmObj?.firm_name}</p>
                      <div className="h-16"></div>
                      <p>(Auth. Signatory)</p>
                  </div>
              </div>
          </div>
      </div>
      <Toast message={toastMessage} />
    </div>
  );
}