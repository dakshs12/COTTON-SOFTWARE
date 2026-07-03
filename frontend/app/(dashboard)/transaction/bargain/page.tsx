"use client";
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Save, Plus, FileText, X, Search, ChevronDown, Check, Edit2 } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search States
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Smart Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isStatusFilterDropdownOpen, setIsStatusFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const DEFAULT_DELIVERY_TERMS = ["Ready", "Forward", "7 Days"];

  const getLearnedOptions = (fieldName: string, defaults: string[], exclude: string[] = []) => {
    const used = bargains.map((b: any) => b[fieldName]).filter(Boolean);
    return Array.from(new Set([...defaults, ...used])).filter((opt: any) => !exclude.includes(opt)).sort();
  };

  const cashDiscOptions = useMemo(() => getLearnedOptions('cash_disc', DEFAULT_CASH_DISC), [bargains]);
  const qualityOptions = useMemo(() => getLearnedOptions('quality_condition', DEFAULT_QC), [bargains]);
  const deliveryTermsOptions = useMemo(() => getLearnedOptions('delivery_terms', DEFAULT_DELIVERY_TERMS), [bargains]);
  const unitOptions = useMemo(() => getLearnedOptions('unit', ['Budhani'], ['Bales', 'Candy']), [bargains]);
  const certificateOptions = useMemo(() => getLearnedOptions('cotton_certificate', CERTIFICATE_OPTIONS), [bargains]);
  
  const stateOptions = useMemo(() => {
    const usedStates = parties.map(p => p.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [parties]);

  const initialFormState = {
    bargain_date: new Date().toISOString().split('T')[0],
    seller: '', buyer: '', state: '', station: '',
    bales: '', rate: '', unit: 'Budhani',
    payment_condition: '', payment_by: 'Dispatch Date',
    cash_disc: '', weight_terms: 'Mill Weight', delivery_terms: '',
    delivery_type: 'Spot', delivery_from: '',
    deal_type: 'Pakka Sauda', cotton_certificate: '',
    quality_condition: '',
    remarks: '', status: 'Pending Passing'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bargainRes, partyRes] = await Promise.all([
        api.get('bargains/'),
        api.get('parties/')
      ]);
      setBargains(bargainRes.data.reverse());
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

  const handleEditClick = (deal: any) => {
    // Replace nulls with empty strings
    const sanitizedDeal = Object.fromEntries(
      Object.entries(deal).map(([k, v]) => [k, v === null ? '' : v])
    );
    
    setFormData({
      ...initialFormState,
      ...sanitizedDeal,
      seller: sanitizedDeal.seller?.toString() || '',
      buyer: sanitizedDeal.buyer?.toString() || '',
      bales: sanitizedDeal.bales?.toString() || '',
      rate: sanitizedDeal.rate?.toString() || '',
      payment_condition: sanitizedDeal.payment_condition?.toString() || '',
    });
    setSellerSearch(deal.seller_name || '');
    setBuyerSearch(deal.buyer_name || '');
    setEditingId(deal.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setSellerSearch("");
    setBuyerSearch("");
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
      if (editingId) {
        await api.put(`bargains/${editingId}/`, payload);
        showToast('Deal Updated Successfully!');
      } else {
        await api.post('bargains/', payload);
        showToast('Deal Saved Successfully!');
      }
      setIsFormOpen(false);
      setEditingId(null);
      fetchData();
      // Reset form
      setFormData(initialFormState);
      setSellerSearch("");
      setBuyerSearch("");
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
  const handleDropdownBlur = (name: string) => {
    setTimeout(() => {
      setActiveDropdown(prev => (prev === name ? null : prev));
    }, 200);
  };

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
             onBlur={() => handleDropdownBlur(name)}
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

  // --- Filter & Pagination Logic ---
  const filteredBargains = bargains.filter(deal => {
    const matchesSearch = 
      (deal.smart_deal_id && deal.smart_deal_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.buyer_name && deal.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.seller_name && deal.seller_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBargains.length / itemsPerPage);
  const currentBargains = filteredBargains.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto neu-fade-in">

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4a7fc4] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 neu-fade-in font-medium tracking-wide">
          <Check size={20} />
          {toastMessage}
        </div>
      )}

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
                   <label className="neu-label">Payment Condition (Days)</label>
                   <input type="number" name="payment_condition" value={formData.payment_condition} onChange={handleChange} className="neu-input" />
                </div>

                {/* Row 3 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Payment By", "payment_by", PAYMENT_BY_OPTIONS)}
                </div>
                <div className="col-span-1">
                  {renderSmartDropdown("Cash Discount", "cash_disc", cashDiscOptions)}
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

                {/* Row 4 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Delivery Terms", "delivery_terms", deliveryTermsOptions)}
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Delivery Type", "delivery_type", DELIVERY_TYPE_OPTIONS)}
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Deal Type", "deal_type", DEAL_TYPE_OPTIONS)}
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Cotton Certificate", "cotton_certificate", certificateOptions)}
                </div>

                {/* Row 5 */}
                <div className="col-span-1">
                   <label className="neu-label">Delivery From</label>
                   <input name="delivery_from" value={formData.delivery_from} onChange={handleChange} className="neu-input" />
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Delivery to (Unit)", "unit", unitOptions)}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Advised By</label>
                   <input name="advised_by" value={formData.advised_by} onChange={handleChange} className="neu-input" />
                </div>
                
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="pt-6 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
               <h3 className="neu-section-title mb-4">Quality Condition & Remarks</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderSmartDropdown("Quality Condition", "quality_condition", qualityOptions)}
               </div>
               <div className="mt-4">
                  <label className="neu-label">Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="neu-input" style={{ height: "64px", resize: "none" }} />
               </div>
               <div className="mt-4 grid grid-cols-1 md:grid-cols-4">
                  <div className="col-span-1">
                     {renderSmartDropdown("Status", "status", STATUS_OPTIONS)}
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-4 pt-6" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={handleCancel} className="neu-btn">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-primary">
                <Save size={18} /> {editingId ? "Update Deal" : "Save Deal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="neu-card p-2 sm:p-4 mt-8">
        <div className="p-3 flex justify-between items-center mb-2 flex-wrap gap-4">
             <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Recent Deals</h3>
             <div className="flex gap-4 items-center">
               <div className="relative">
                 <button
                   onClick={() => setIsStatusFilterDropdownOpen(!isStatusFilterDropdownOpen)}
                   className="neu-input py-2 px-4 flex items-center justify-between gap-2"
                   style={{ minWidth: "160px" }}
                 >
                   <span>{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
                   <ChevronDown size={16} style={{ color: "var(--cb-primary)" }} />
                 </button>
                 {isStatusFilterDropdownOpen && (
                   <ul className="neu-dropdown z-50" style={{ maxHeight: 'none' }}>
                     {["All", "Pending Passing", "Approved", "Rejected", "Cancelled"].map(status => (
                       <li 
                         key={status} 
                         onClick={() => {
                           setStatusFilter(status);
                           setCurrentPage(1);
                           setIsStatusFilterDropdownOpen(false);
                         }}
                         className="flex items-center justify-between"
                       >
                         {status === 'All' ? 'All Status' : status}
                         {statusFilter === status && <Check size={14} style={{ color: "var(--cb-primary)" }}/>}
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
               <div className="relative">
                 <Search className="absolute right-3 top-2.5" size={16} style={{ color: "var(--cb-text-label)" }} />
                 <input 
                   type="text" 
                   placeholder="Search deal, buyer, seller..." 
                   className="neu-input pl-4 pr-9 py-2" 
                   style={{ width: "240px" }}
                   value={searchTerm}
                   onChange={(e) => {
                     setSearchTerm(e.target.value);
                     setCurrentPage(1);
                   }}
                 />
               </div>
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
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading...</td></tr>
              ) : currentBargains.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>No deals found.</td></tr>
              ) : currentBargains.map((deal) => (
                <tr key={deal.deal_no || deal.id}>
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
                  <td className="text-right">
                    <button 
                      onClick={() => handleEditClick(deal)}
                      className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-100 text-gray-500 hover:text-[#4a7fc4]"
                      title="Edit Deal"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {!loading && totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-gray-100 mt-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBargains.length)} of {filteredBargains.length} entries
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="neu-btn px-4 py-1.5"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="neu-btn px-4 py-1.5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}