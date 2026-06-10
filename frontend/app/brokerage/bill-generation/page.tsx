"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Printer, FileText, Check, ChevronDown } from 'lucide-react';
import CustomDatePicker from '@/app/components/CustomDatePicker';

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

export default function BillGenerationPage() {
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

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const [pRes, fRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/parties/'),
        axios.get('http://127.0.0.1:8000/api/firms/')
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
      const res = await axios.get(`http://127.0.0.1:8000/api/brokerage/pending/?party_id=${partyId}`);
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

    if (selectedParty && selectedFirm) {
        const pState = selectedParty.state?.toLowerCase().trim();
        const fState = selectedFirm.state?.toLowerCase().trim();

        if (pState && fState && pState === fState) {
            cgst = (gross * 9) / 100;
            sgst = (gross * 9) / 100;
        } else {
            igst = (gross * 18) / 100;
        }
    } else {
        igst = (gross * 18) / 100; // Default
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

  }, [selectedIds, totals.rate, formData.party_id, formData.firm_id]);

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return alert("Please select deliveries.");
    if (!formData.bill_no) return alert("Enter Bill No.");

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
      await axios.post('http://127.0.0.1:8000/api/brokerage/generate/', payload);
      alert("Bill Generated Successfully!");
      fetchPendingDeliveries(formData.party_id);
      setFormData(prev => ({ ...prev, bill_no: '' }));
      // Optionally trigger print here automatically
    } catch (error: any) {
      console.error("Generation failed:", error);
      alert("Error: " + JSON.stringify(error.response?.data || error.message));
    }
  };

  const selectedPartyObj = parties.find(p => p.id == formData.party_id);
  const selectedFirmObj = firms.find(f => f.id == formData.firm_id);
  const selectedDeliveryItems = pendingDeliveries.filter(d => selectedIds.includes(d.id));

  return (
    <div className="max-w-7xl mx-auto neu-fade-in pb-20">
      
      {/* SCREEN VIEW (HIDDEN ON PRINT) */}
      <div className="print:hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="neu-page-title text-3xl">Brokerage Bill</h1>
              <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>Generate commission invoices.</p>
            </div>
            <button onClick={() => window.print()} className="neu-btn" style={{ color: "var(--cb-text-heading)" }}>
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
                                    {firms.filter(f => f.firm_name.toLowerCase().includes(firmSearch.toLowerCase())).map(f => (
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
                                    {parties.filter(p => p.company_name.toLowerCase().includes(partySearch.toLowerCase())).map(p => (
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
                    </div>
                </div>

                {/* Summary Card */}
                <div className="neu-card p-6">
                    <h3 className="font-bold mb-4" style={{ color: "var(--cb-text-heading)" }}>Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--cb-divider)" }}>
                            <span className="font-bold" style={{ color: "var(--cb-text-body)" }}>Brokerage Rate</span>
                            <input
                              type="number"
                              value={totals.rate}
                              onChange={(e) => setTotals({...totals, rate: parseFloat(e.target.value) || 0})}
                              className="neu-input w-20 text-right font-mono"
                              style={{ padding: "0.3rem 0.5rem" }}
                            />
                        </div>
                        <div className="flex justify-between font-bold text-lg" style={{ color: "var(--cb-text-heading)" }}>
                            <span>Gross Amount</span><span>₹{totals.gross_amount.toLocaleString()}</span>
                        </div>
                        {totals.igst > 0 ? (
                            <div className="flex justify-between font-medium" style={{ color: "var(--cb-warning)" }}>
                              <span>IGST (18%)</span><span>₹{totals.igst}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between font-medium" style={{ color: "var(--cb-primary)" }}>
                                  <span>CGST (9%)</span><span>₹{totals.cgst}</span>
                                </div>
                                <div className="flex justify-between font-medium" style={{ color: "var(--cb-primary)" }}>
                                  <span>SGST (9%)</span><span>₹{totals.sgst}</span>
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
                          className="neu-btn neu-btn-primary w-full mt-4 py-3 disabled:opacity-50"
                          style={{ justifyContent: "center" }}
                        >
                            <Save size={20} /> Generate Bill
                        </button>
                    </div>
                </div>
            </div>

            {/* Pending Deliveries Table */}
            <div className="lg:col-span-2 neu-card overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--cb-divider)" }}>
                    <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Pending Deliveries</h3>
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
                                <th>Role</th>
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
                                    <td>
                                      <span className="text-xs uppercase font-bold" style={{ color: "var(--cb-text-placeholder)" }}>{item.role}</span>
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

      {/* --- REAL PRINT TEMPLATE (Matches your Screenshot EXACTLY) --- */}
      <div className="hidden print:block font-serif text-black p-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
              <div>
                  <h1 className="text-2xl font-bold text-red-800 uppercase tracking-wide">{selectedFirmObj?.firm_name || "YOUR FIRM NAME"}</h1>
                  <p className="font-bold text-sm">Cotton Broker & Commission Agent</p>
                  <p className="text-xs mt-1 w-64">{selectedFirmObj?.address || "Address Line 1, City - Zip"}</p>
                  <p className="text-xs">Email: {selectedFirmObj?.email || "-"}</p>
                  <p className="text-xs font-bold mt-1">GST: {selectedFirmObj?.gst_no}</p>
                  <p className="text-xs font-bold">PAN: {selectedFirmObj?.pan_no}</p>
              </div>
              {/* Logo Placeholder */}
              <div className="w-24 h-24 border border-dashed border-gray-400 rounded-full flex items-center justify-center text-xs text-gray-500">
                  Logo
              </div>
          </div>

          {/* Bill Info */}
          <div className="flex justify-between items-end mb-6">
              <div className="text-sm">
                  <p className="font-bold">To,</p>
                  <p className="font-bold uppercase text-lg">{selectedPartyObj?.company_name}</p>
                  <p>{selectedPartyObj?.address}</p>
                  <p className="font-bold">GST No: {selectedPartyObj?.gst_no}</p>
              </div>
              <div className="text-sm text-right">
                  <p className="font-bold">Bill No: <span className="text-lg">{formData.bill_no}</span></p>
                  <p className="font-bold">Date: {formData.bill_date}</p>
              </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs border-collapse border-t-2 border-b-2 border-black mb-4">
              <thead>
                  <tr className="border-b border-black border-dashed">
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Station</th>
                      <th className="py-2 text-center">Bales</th>
                      <th className="py-2 text-center">Truck No</th>
                      <th className="py-2 text-center">Deal Date</th>
                      <th className="py-2 text-right">Deal Rate</th>
                  </tr>
              </thead>
              <tbody className="leading-relaxed">
                  {selectedDeliveryItems.map((item) => (
                      <tr key={item.id}>
                          <td className="py-1">{item.counter_party}</td>
                          <td className="py-1">{item.station}</td>
                          <td className="py-1 text-center">{item.bales}</td>
                          <td className="py-1 text-center font-mono">{item.truck_no}</td>
                          <td className="py-1 text-center">{item.date}</td>
                          <td className="py-1 text-right">{item.deal_rate}</td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* Total Bales */}
          <div className="flex justify-between text-sm font-bold border-b border-black border-dashed pb-2 mb-2">
              <span>Total Bales :</span>
              <span>{totals.total_bales}</span>
          </div>

          {/* Financials */}
          <div className="text-sm w-1/2 ml-auto">
              <div className="flex justify-between py-1">
                  <span>Brokerage @{totals.rate}/- Per Bale</span>
                  <span>{totals.gross_amount.toFixed(2)}</span>
              </div>
              {totals.igst > 0 ? (
                 <div className="flex justify-between py-1"><span>IGST @18%</span><span>{totals.igst.toFixed(2)}</span></div>
              ) : (
                 <>
                   <div className="flex justify-between py-1"><span>CGST @9%</span><span>{totals.cgst.toFixed(2)}</span></div>
                   <div className="flex justify-between py-1"><span>SGST @9%</span><span>{totals.sgst.toFixed(2)}</span></div>
                 </>
              )}
              <div className="flex justify-between py-2 border-t-2 border-b-2 border-black font-bold text-lg mt-2">
                  <span>Total Amount :</span>
                  <span>Rs. {totals.net_amount.toFixed(2)}</span>
              </div>
          </div>

          {/* Amount In Words */}
          <div className="mt-4 text-sm font-bold border-b border-black border-dashed pb-4">
              Total Amount in Words: <span className="uppercase">{totals.amount_in_words} Only</span>
          </div>

          {/* Bank Details */}
          <div className="mt-6 text-xs font-bold">
              <p>Bank: {selectedFirmObj?.bank_name}</p>
              <p>Branch: {selectedFirmObj?.branch}</p>
              <p>A/c No: {selectedFirmObj?.bank_ac_no}</p>
              <p>IFSC: {selectedFirmObj?.ifsc_code}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-end text-xs">
              <p>E & O.E (Subject to {selectedFirmObj?.city || 'Indore'} Jurisdiction)</p>
              <div className="text-center">
                  <p className="font-bold">For, {selectedFirmObj?.firm_name}</p>
                  <div className="h-12"></div>
                  <p>(Auth. Signatory)</p>
              </div>
          </div>
      </div>
    </div>
  );
}