"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Save, Plus, FileText, X, Search, ChevronDown, Check } from 'lucide-react';
// Import the new Calendar from your existing folder
import CustomDatePicker from '@/app/components/CustomDatePicker';

// Helper to format date as DD-MM-YYYY
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    if (parts[2].length === 4) return dateStr;
  }
  return dateStr;
};

export default function BargainEntryPage() {
  const [bargains, setBargains] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search States
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);

  // Smart Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // --- Fixed Option Lists ---
  const PAYMENT_BY_OPTIONS = ["Dispatch Date", "Mill Arrival Date", "Passing Date", "Settlement Date"];
  const DELIVERY_TYPE_OPTIONS = ["Spot", "MD-FOR", "MD", "Ex-Gin", "FOR", "Other"];
  const DEAL_TYPE_OPTIONS = ["Pakka Sauda", "Sub. to Passing", "Mill Condition/Direct Dispatch", "Spot", "Forward"];
  const STATUS_OPTIONS = ["Pending Passing", "Approved", "Rejected", "Cancelled"];
  const UNIT_OPTIONS = ["Candy", "Bales", "Tons", "KGs"];
  const CERTIFICATE_OPTIONS = ["Better Cotton (BCI)", "Organic", "Conventional", "REEL"];
  
  // State Options
  const DEFAULT_STATES = [
    "AP", "Chhattisgarh", "Delhi", "Gujarat", "Haryana", "Himachal", 
    "Karnataka", "MH", "MP", "Madhya Pradesh", "Odisha", "Punjab", 
    "Rajasthan", "TN", "Telangana", "UP"
  ];

  // --- Learning Lists ---
  const DEFAULT_CASH_DISC = ["15% pa", "18% pa", "NA", "Net Cash"];
  const DEFAULT_QC = ["Length 29mm", "Length 28.5mm", "Rd 75", "Trash 3%"];
  const DEFAULT_BARGAIN_TYPE = ["Regular", "High Seas", "Mcx"];

  const getLearnedOptions = (fieldName: string, defaults: string[]) => {
    const used = bargains.map((b: any) => b[fieldName]).filter(Boolean);
    return Array.from(new Set([...defaults, ...used])).sort();
  };

  const cashDiscOptions = useMemo(() => getLearnedOptions('cash_disc', DEFAULT_CASH_DISC), [bargains]);
  const qcOptions = useMemo(() => getLearnedOptions('qc_seller', DEFAULT_QC), [bargains]);
  const bargainTypeOptions = useMemo(() => getLearnedOptions('bargain_type', DEFAULT_BARGAIN_TYPE), [bargains]);
  const certificateOptions = useMemo(() => getLearnedOptions('cotton_certificate', CERTIFICATE_OPTIONS), [bargains]);
  
  const stateOptions = useMemo(() => {
    const usedStates = parties.map(p => p.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [parties]);

  const [formData, setFormData] = useState({
    bargain_date: new Date().toISOString().split('T')[0],
    seller: '', buyer: '', state: '', station: '',
    bales: '', rate: '', unit: 'Candy',
    payment_condition: '', payment_by: 'Dispatch Date',
    cash_disc: '', 
    delivery_terms: '', delivery_type: 'Spot', delivery_from: '',
    deal_type: 'Pakka Sauda', cotton_certificate: '',
    weight_terms: 'Mill Weight',
    advised_by: '', status: 'Pending Passing',
    qc_seller: '', qc_buyer: '',
    bargain_type: '', bargain_no_manual: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bargainRes, partyRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/bargains/'),
        axios.get('http://127.0.0.1:8000/api/parties/')
      ]);
      setBargains(bargainRes.data);
      setParties(partyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper for the Custom Calendar
  const handleDateChange = (val: string) => {
    setFormData({ ...formData, bargain_date: val });
  };

  const handleAutoSelect = (name: string, val: string) => {
    setFormData({ ...formData, [name]: val });
    setActiveDropdown(null);
  };

  const handlePartySelect = (type: 'seller' | 'buyer', partyId: string, partyName: string, partyStation: string, partyState: string) => {
    if (type === 'seller') {
      setFormData(prev => ({ ...prev, seller: partyId, station: partyStation, state: partyState })); 
      setSellerSearch(partyName);
      setIsSellerDropdownOpen(false);
    } else {
      setFormData(prev => ({ ...prev, buyer: partyId }));
      setBuyerSearch(partyName);
      setIsBuyerDropdownOpen(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // 1. Validation: Ensure Seller and Buyer are selected
    if (!formData.seller || !formData.buyer) {
      alert("Please select both a Seller and a Buyer.");
      return;
    }

    // 2. Data Cleaning: Convert strings to numbers
    const payload = {
      ...formData,
      bales: formData.bales ? parseInt(formData.bales) : 0,
      rate: formData.rate ? parseFloat(formData.rate) : 0,
      payment_condition: formData.payment_condition ? parseInt(formData.payment_condition) : 0,
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/bargains/', payload);
      alert('Deal Saved Successfully!');
      setIsFormOpen(false);
      fetchData();
      // Reset form
      setFormData({ 
        ...formData, 
        bales: '', 
        rate: '', 
        remarks: '', 
        bargain_no_manual: '',
        payment_condition: '' 
      }); 
    } catch (error: any) {
      console.error("Error saving deal:", error);
      // Show the specific error message from the backend if available
      if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Error saving deal. Please check all fields.');
      }
    }
  };

  // --- REUSABLE SMART DROPDOWN ---
  const renderSmartDropdown = (label: string, name: string, options: string[], placeholder: string = "Select...") => {
    const filtered = options.filter(opt => opt.toLowerCase().includes((formData as any)[name]?.toLowerCase() || ''));
    
    return (
      <div className="relative">
        <label className="neu-label">{label}</label>
        <div className="relative">
           <input 
             name={name}
             value={(formData as any)[name]}
             onChange={handleChange}
             onFocus={() => setActiveDropdown(name)}
             onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
             className="neu-input cursor-pointer pr-10"
             placeholder={placeholder}
             autoComplete="off"
           />
           <ChevronDown
             size={16}
             className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${activeDropdown === name ? 'rotate-180' : ''}`}
             style={{ color: "var(--cb-text-label)" }}
           />
           
           {activeDropdown === name && (
             <ul className="neu-dropdown">
               {filtered.map(opt => (
                 <li key={opt} onMouseDown={() => handleAutoSelect(name, opt)}>
                   {opt}
                   {(formData as any)[name] === opt && <Check size={14} style={{ color: "var(--cb-primary)" }}/>}
                 </li>
               ))}
               {filtered.length === 0 && (
                 <li className="italic" style={{ color: "var(--cb-text-placeholder)", fontSize: "0.75rem", cursor: "default" }}>
                   Type to add new...
                 </li>
               )}
             </ul>
           )}
        </div>
      </div>
    );
  };

  const filteredSellers = parties.filter(p => p.company_name.toLowerCase().includes(sellerSearch.toLowerCase()));
  const filteredBuyers = parties.filter(p => p.company_name.toLowerCase().includes(buyerSearch.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto neu-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Bargain Entry</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>Log new deals.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="neu-btn neu-btn-primary">
          <Plus size={18} /> New Deal
        </button>
      </div>

      {isFormOpen && (
        <div className="neu-card p-8 mb-8 relative">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full transition-colors duration-150 cursor-pointer"
            style={{ color: "var(--cb-text-label)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--cb-danger)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--cb-text-label)"; }}
          >
            <X size={20} />
          </button>
          <h2
            className="text-lg font-bold mb-6 pb-3 flex items-center gap-2"
            style={{
              color: "var(--cb-text-heading)",
              borderBottom: "2px solid var(--cb-divider)",
              fontFamily: "var(--font-playfair-display), 'Playfair Display', serif",
            }}
          >
            <FileText size={20} style={{ color: "var(--cb-primary)" }}/> Deal Details
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5">
                
                {/* Row 1 */}
                <div className="col-span-1">
                   {/* NEW CALENDAR COMPONENT */}
                   <CustomDatePicker 
                      label="Bargain Date" 
                      value={formData.bargain_date} 
                      onChange={handleDateChange} 
                   />
                </div>
                
                <div className="col-span-1 relative">
                    <label className="neu-label">Seller</label>
                    <input
                      type="text"
                      value={sellerSearch}
                      onChange={(e) => { setSellerSearch(e.target.value); setIsSellerDropdownOpen(true); }}
                      onFocus={() => setIsSellerDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsSellerDropdownOpen(false), 200)}
                      placeholder="Search..."
                      className="neu-input cursor-pointer"
                      required
                    />
                    {isSellerDropdownOpen && (
                      <ul className="neu-dropdown">
                        {filteredSellers.map(p => (
                          <li key={p.id} onMouseDown={() => handlePartySelect('seller', p.id, p.company_name, p.station, p.state)}>
                            {p.company_name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
                
                <div className="col-span-1 relative">
                    <label className="neu-label">Buyer</label>
                    <input
                      type="text"
                      value={buyerSearch}
                      onChange={(e) => { setBuyerSearch(e.target.value); setIsBuyerDropdownOpen(true); }}
                      onFocus={() => setIsBuyerDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsBuyerDropdownOpen(false), 200)}
                      placeholder="Search..."
                      className="neu-input cursor-pointer"
                      required
                    />
                    {isBuyerDropdownOpen && (
                      <ul className="neu-dropdown">
                        {filteredBuyers.map(p => (
                          <li key={p.id} onMouseDown={() => handlePartySelect('buyer', p.id, p.company_name, '', '')}>
                            {p.company_name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
                
                <div className="col-span-1">
                   <label className="neu-label">Station</label>
                   <input name="station" value={formData.station} onChange={handleChange} className="neu-input" />
                </div>

                {/* Row 2 */}
                <div className="col-span-1">
                   {renderSmartDropdown("State", "state", stateOptions)}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Bales</label>
                   <input type="number" name="bales" value={formData.bales} onChange={handleChange} className="neu-input font-mono" required />
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Rate</label>
                   <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="neu-input font-mono" required />
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Payment (Days)</label>
                   <input type="number" name="payment_condition" value={formData.payment_condition} onChange={handleChange} className="neu-input" />
                </div>

                {/* Row 3 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Payment By", "payment_by", PAYMENT_BY_OPTIONS)}
                </div>
                <div className="col-span-1">
                  {renderSmartDropdown("Cash Disc", "cash_disc", cashDiscOptions)}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Delivery Terms</label>
                   <input name="delivery_terms" value={formData.delivery_terms} onChange={handleChange} className="neu-input" />
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Delivery Type", "delivery_type", DELIVERY_TYPE_OPTIONS)}
                </div>

                {/* Row 4 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Deal Type", "deal_type", DEAL_TYPE_OPTIONS)}
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Cotton Certificate", "cotton_certificate", certificateOptions)}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Delivery From</label>
                   <input name="delivery_from" value={formData.delivery_from} onChange={handleChange} className="neu-input" />
                </div>
                 <div className="col-span-1">
                   {renderSmartDropdown("Status", "status", STATUS_OPTIONS)}
                </div>

                 {/* Row 5 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Unit", "unit", UNIT_OPTIONS)}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Advised By</label>
                   <input name="advised_by" value={formData.advised_by} onChange={handleChange} className="neu-input" />
                </div>
                
                {/* Weight Terms */}
                <div className="col-span-2 flex items-center gap-8 pt-6 pl-2">
                   <label className="neu-label mr-2" style={{ marginBottom: 0, fontSize: "0.8rem" }}>Weight Terms:</label>
                   <label
                     className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all duration-150"
                     style={{
                       background: formData.weight_terms === 'Mill Weight' ? 'rgba(74, 127, 196, 0.08)' : 'transparent',
                       border: formData.weight_terms === 'Mill Weight' ? '1px solid rgba(74, 127, 196, 0.2)' : '1px solid transparent',
                       borderRadius: "var(--cb-radius-sm)",
                     }}
                   >
                      <input type="radio" name="weight_terms" value="Mill Weight" checked={formData.weight_terms === 'Mill Weight'} onChange={handleChange} className="w-4 h-4 cursor-pointer accent-[#4a7fc4]"/>
                      <span className="text-sm font-medium" style={{ color: "var(--cb-text-body)" }}>Mill Weight</span>
                   </label>
                   <label
                     className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all duration-150"
                     style={{
                       background: formData.weight_terms === 'Spot Weight' ? 'rgba(74, 127, 196, 0.08)' : 'transparent',
                       border: formData.weight_terms === 'Spot Weight' ? '1px solid rgba(74, 127, 196, 0.2)' : '1px solid transparent',
                       borderRadius: "var(--cb-radius-sm)",
                     }}
                   >
                      <input type="radio" name="weight_terms" value="Spot Weight" checked={formData.weight_terms === 'Spot Weight'} onChange={handleChange} className="w-4 h-4 cursor-pointer accent-[#4a7fc4]"/>
                      <span className="text-sm font-medium" style={{ color: "var(--cb-text-body)" }}>Spot Weight</span>
                   </label>
                </div>
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="pt-6 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
               <h3 className="neu-section-title mb-4">Quality Condition & Remarks</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderSmartDropdown("QC Seller", "qc_seller", qcOptions)}
                  {renderSmartDropdown("QC Buyer", "qc_buyer", qcOptions)}
                  
                  {renderSmartDropdown("Bargain Type", "bargain_type", bargainTypeOptions)}
                  <div>
                    <label className="neu-label">Bargain No. (Manual)</label>
                    <input name="bargain_no_manual" value={formData.bargain_no_manual} onChange={handleChange} className="neu-input" />
                  </div>
               </div>
               <div className="mt-4">
                  <label className="neu-label">Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="neu-input" style={{ height: "64px", resize: "none" }} />
               </div>
            </div>

            <div className="flex justify-end gap-4 pt-6" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={() => setIsFormOpen(false)} className="neu-btn">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-primary">
                <Save size={18} /> Save Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="neu-card overflow-hidden p-2 sm:p-4">
        <div className="p-3 flex justify-between items-center mb-2">
             <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Recent Deals</h3>
             <div className="relative">
               <Search className="absolute right-3 top-2.5" size={16} style={{ color: "var(--cb-text-label)" }} />
               <input type="text" placeholder="Search..." className="neu-input pl-4 pr-9 py-2" style={{ width: "220px" }} />
             </div>
        </div>
        <div className="overflow-x-auto" style={{ borderRadius: "12px" }}>
          <table className="neu-table">
            <thead>
               <tr>
                <th>Deal No</th>
                <th>Date</th>
                <th>Seller</th>
                <th>Buyer</th>
                <th>Bales</th>
                <th>Rate</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading...</td></tr>
              ) : bargains.map((deal) => (
                <tr key={deal.deal_no}>
                  <td className="font-mono font-bold" style={{ color: "var(--cb-primary)" }}>{deal.smart_deal_id}</td>
                  <td>{formatDate(deal.bargain_date)}</td>
                  <td className="font-medium" style={{ color: "var(--cb-text-heading)" }}>{deal.seller_name}</td>
                  <td className="font-medium" style={{ color: "var(--cb-text-heading)" }}>{deal.buyer_name}</td>
                  <td className="font-mono">{deal.bales}</td>
                  <td className="font-mono">{deal.rate}</td>
                  <td className="text-right">
                    <span className="neu-chip" style={{ color: "var(--cb-warning)", fontSize: "0.7rem" }}>
                      {deal.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}