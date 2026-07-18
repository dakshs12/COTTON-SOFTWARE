"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Save, Plus, FileText, X, Search, ChevronDown, Check, Edit2, Trash2 } from 'lucide-react';
// Import the new Calendar from your existing folder
import CustomDatePicker from '@/app/components/CustomDatePicker';
import { useDropdownKeyboardNav } from '@/app/hooks/useDropdownKeyboardNav';

const SmartDropdown = ({ label, name, options, placeholder = "Select...", formData, setFormData, activeDropdown, setActiveDropdown }: any) => {
  const currentValue = (formData as any)[name] || '';
  const isMatched = options.includes(currentValue);
  const filtered = isMatched 
    ? options 
    : options.filter((opt: string) => opt.toLowerCase().includes(currentValue.toLowerCase()));
    
  const isOpen = activeDropdown === name;
  const setIsOpen = (open: boolean) => setActiveDropdown(open ? name : null);

  const handleSelect = (opt: string) => {
    setFormData({ ...formData, [name]: opt });
    setActiveDropdown(null);
  };

  const { highlightedIndex, handleKeyDown, listRef } = useDropdownKeyboardNav(filtered, isOpen, setIsOpen, handleSelect);

  return (
      <div className="relative">
        <label className="neu-label">{label}</label>
        <div className="relative">
           <input 
             name={name}
             value={(formData as any)[name]}
             onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
             onFocus={() => setIsOpen(true)}
             onBlur={() => setTimeout(() => setIsOpen(false), 200)}
             onKeyDown={handleKeyDown}
             className="neu-input cursor-pointer pr-10"
             placeholder={placeholder}
             autoComplete="off"
           />
           <ChevronDown
             size={16}
             className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
             style={{ color: "var(--cb-text-label)" }}
           />
           
           {isOpen && (
             <ul className="neu-dropdown" ref={listRef as React.RefObject<HTMLUListElement>}>
               {filtered.map((opt: string, idx: number) => (
                 <li 
                   key={opt} 
                   onMouseDown={() => handleSelect(opt)}
                   style={highlightedIndex === idx ? { backgroundColor: '#dde3eb' } : {}}
                 >
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
  const [splits, setSplits] = useState<any[]>([]);
  
  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{id: number, displayId: string} | null>(null);

  // Search States
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text: msg, type });
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
  const CERTIFICATE_OPTIONS = ["N.A.", "Better Cotton (BCI)", "Organic", "Conventional", "REEL"];
  
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
    deal_type: 'Pakka Sauda', cotton_certificate: 'N.A.',
    quality_condition: '',
    advised_by: '',
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
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'station') {
        newData.delivery_from = value;
      }
      return newData;
    });
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
      setFormData(prev => ({ ...prev, seller: partyId, station: partyStation, state: partyState, delivery_from: partyStation })); 
      setSellerSearch(partyName);
      setIsSellerDropdownOpen(false);
    } else {
      setFormData(prev => ({ ...prev, buyer: partyId }));
      setBuyerSearch(partyName);
      setIsBuyerDropdownOpen(false);
    }
  };

  const handleEditClick = (deal: any) => {
    const originalDeal = bargains.find(b => b.deal_no === deal.deal_no) || deal;
    
    // Replace nulls with empty strings
    const sanitizedDeal = Object.fromEntries(
      Object.entries(originalDeal).map(([k, v]) => [k, v === null ? '' : v])
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
    setEditingId(deal.deal_no);
    setSplits(deal.splits || []);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setSellerSearch("");
    setBuyerSearch("");
    setSplits([]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // 1. Validation: Ensure Seller and Buyer are selected
    if (!formData.seller || !formData.buyer) {
      showToast("Please select both a Seller and a Buyer.", 'error');
      return;
    }

    // 2. Data Cleaning: Convert strings to numbers
    const payload: any = {
      ...formData,
      bales: formData.bales ? parseInt(formData.bales) : 0,
      rate: formData.rate ? parseFloat(formData.rate) : 0,
      payment_condition: formData.payment_condition ? parseInt(formData.payment_condition) : 0,
    };
    
    if (splits.length > 0) {
      const totalSplits = splits.reduce((sum, s) => sum + (parseInt(s.bales) || 0), 0);
      if (totalSplits !== payload.bales) {
        showToast("Total split bales must equal the total deal bales.", 'error');
        return;
      }
      payload.splits = splits;
    } else {
      payload.splits = [];
    }
    
    delete payload.created_at;
    delete payload.updated_at;
    delete payload.deleted_at;

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
      setSplits([]);
    } catch (error: any) {
      console.error("Error saving deal:", error);
      // Show the specific error message from the backend if available
      if (error.response && error.response.data) {
        showToast(`Error: ${JSON.stringify(error.response.data, 'error')}`);
      } else {
        showToast('Error saving deal. Please check all fields.', 'error');
      }
    }
  };

  const triggerDelete = (id: number, displayId: string) => {
    setRecordToDelete({ id, displayId });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await api.delete(`bargains/${recordToDelete.id}/`);
      showToast('Deal Deleted Successfully!');
      fetchData();
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Error deleting deal:", error);
      showToast('Error deleting deal.', 'error');
    }
  };

  const renderSmartDropdown = (label: string, name: string, options: string[], placeholder: string = "Select...") => {
    return <SmartDropdown label={label} name={name} options={options} placeholder={placeholder} formData={formData} setFormData={setFormData} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} />;
  };

  const allowedSellerTypes = ["Seller", "Ginner", "Trader"];
  const allowedBuyerTypes = ["Buyer", "Mill", "Trader"];

  const isSellerMatched = parties.some(p => allowedSellerTypes.includes(p.party_type) && p.company_name === sellerSearch);
  const filteredSellers = parties.filter(p => 
    allowedSellerTypes.includes(p.party_type) && 
    String(p.id) !== String(formData.buyer) &&
    (isSellerMatched ? true : p.company_name.toLowerCase().includes(sellerSearch.toLowerCase()))
  );
  
  const isBuyerMatched = parties.some(p => allowedBuyerTypes.includes(p.party_type) && p.company_name === buyerSearch);
  const filteredBuyers = parties.filter(p => 
    allowedBuyerTypes.includes(p.party_type) && 
    String(p.id) !== String(formData.seller) &&
    (isBuyerMatched ? true : p.company_name.toLowerCase().includes(buyerSearch.toLowerCase()))
  );

  // --- Filter & Pagination Logic ---
  const filteredBargains = bargains.filter(deal => {
    const matchesSearch = 
      (deal.smart_deal_id && deal.smart_deal_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.buyer_name && deal.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.seller_name && deal.seller_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const flattenedBargains = useMemo(() => {
    const flat: any[] = [];
    filteredBargains.forEach(deal => {
      if (deal.splits && deal.splits.length > 0) {
        deal.splits.forEach((split: any) => {
          flat.push({ ...deal, bales: split.bales, status: split.status, is_split: true, split_id: split.id });
        });
      } else {
        flat.push(deal);
      }
    });
    return flat;
  }, [filteredBargains]);

  const totalPages = Math.ceil(flattenedBargains.length / itemsPerPage);
  const currentBargains = flattenedBargains.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const { highlightedIndex: sellerHighlightedIndex, handleKeyDown: handleSellerKeyDown, listRef: sellerListRef } = useDropdownKeyboardNav(
    filteredSellers,
    isSellerDropdownOpen,
    setIsSellerDropdownOpen,
    (p: any) => handlePartySelect('seller', p.id, p.company_name, p.station, p.state)
  );

  const { highlightedIndex: buyerHighlightedIndex, handleKeyDown: handleBuyerKeyDown, listRef: buyerListRef } = useDropdownKeyboardNav(
    filteredBuyers,
    isBuyerDropdownOpen,
    setIsBuyerDropdownOpen,
    (p: any) => handlePartySelect('buyer', p.id, p.company_name, '', '')
  );

  return (
    <div className="max-w-7xl mx-auto neu-fade-in">



      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Bargain Entry</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>Log new deals.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="neu-btn neu-btn-action">
          <Plus size={18} /> New Deal
        </button>
      </div>

      {isFormOpen && (
        <div className="neu-card p-8 mb-8 relative">
          <button
            onClick={() => setIsFormOpen(false)}
            className="neu-btn neu-btn-cancel-action absolute top-5 right-5 p-2 rounded-full cursor-pointer"
            style={{ padding: "0.5rem" }}
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
                      onKeyDown={handleSellerKeyDown}
                      placeholder="Search..."
                      className="neu-input cursor-pointer"
                      required
                    />
                    {isSellerDropdownOpen && (
                      <ul className="neu-dropdown" ref={sellerListRef as React.RefObject<HTMLUListElement>}>
                        {filteredSellers.map((p, idx) => (
                          <li 
                            key={p.id} 
                            onMouseDown={() => handlePartySelect('seller', p.id, p.company_name, p.station, p.state)}
                            style={sellerHighlightedIndex === idx ? { backgroundColor: '#dde3eb' } : {}}
                          >
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
                      onKeyDown={handleBuyerKeyDown}
                      placeholder="Search..."
                      className="neu-input cursor-pointer"
                      required
                    />
                    {isBuyerDropdownOpen && (
                      <ul className="neu-dropdown" ref={buyerListRef as React.RefObject<HTMLUListElement>}>
                        {filteredBuyers.map((p, idx) => (
                          <li 
                            key={p.id} 
                            onMouseDown={() => handlePartySelect('buyer', p.id, p.company_name, '', '')}
                            style={buyerHighlightedIndex === idx ? { backgroundColor: '#dde3eb' } : {}}
                          >
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
                   <input 
                     type="number" 
                     name="bales" 
                     min="0"
                     onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                     value={formData.bales} 
                     onChange={handleChange} 
                     className="neu-input font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                     required 
                   />
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Rate</label>
                   <input 
                     type="number" 
                     name="rate" 
                     min="0"
                     onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                     value={formData.rate} 
                     onChange={handleChange} 
                     className="neu-input font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                     required 
                   />
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Payment Condition (Days)</label>
                   <input 
                     type="number" 
                     name="payment_condition" 
                     min="0"
                     onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                     value={formData.payment_condition} 
                     onChange={handleChange} 
                     className="neu-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                   />
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
               
               {splits.length === 0 && (
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-4">
                    <div className="col-span-1">
                       {renderSmartDropdown("Overall Status", "status", STATUS_OPTIONS)}
                    </div>
                 </div>
               )}

               {/* Bales Split Section */}
               <div className="mt-6 p-5 rounded-xl border border-dashed" style={{ borderColor: "var(--cb-divider)" }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm" style={{ color: "var(--cb-text-heading)" }}>Bales Split</h3>
                    {formData.bales && parseInt(formData.bales) > 0 && (
                      <span className="text-xs font-semibold" style={{ color: "var(--cb-text-label)" }}>
                        Total Deal: <span style={{ color: "var(--cb-primary)" }}>{formData.bales}</span> | 
                        Allocated: <span style={{ color: "var(--cb-secondary)" }}>{splits.reduce((sum, s) => sum + (parseInt(s.bales)||0), 0)}</span>
                      </span>
                    )}
                  </div>
                  
                  {splits.map((split, idx) => (
                    <div key={idx} className="flex gap-4 items-end mb-3">
                      <div className="flex-1 relative">
                        <label className="neu-label text-xs">Split {idx + 1} Bales</label>
                        <input 
                          type="number"
                          min="0"
                          onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} 
                          value={split.bales} 
                          onChange={(e) => {
                            const newSplits = [...splits];
                            newSplits[idx].bales = e.target.value;
                            setSplits(newSplits);
                          }}
                          className="neu-input font-mono" 
                          placeholder="e.g. 200"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <label className="neu-label text-xs">Status</label>
                        <div className="relative">
                           <div 
                             className="neu-input cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                             tabIndex={0}
                             onKeyDown={(e) => {
                               const isOpen = activeDropdown === `split-status-${idx}`;
                               if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
                                 e.preventDefault();
                                 setActiveDropdown(`split-status-${idx}`);
                                 return;
                               }
                               if (isOpen) {
                                 const currentIndex = STATUS_OPTIONS.indexOf(split.status || 'Pending Passing');
                                 if (e.key === 'ArrowDown') {
                                   e.preventDefault();
                                   const next = Math.min(currentIndex + 1, STATUS_OPTIONS.length - 1);
                                   const newSplits = [...splits];
                                   newSplits[idx].status = STATUS_OPTIONS[next];
                                   setSplits(newSplits);
                                 } else if (e.key === 'ArrowUp') {
                                   e.preventDefault();
                                   const prev = Math.max(currentIndex - 1, 0);
                                   const newSplits = [...splits];
                                   newSplits[idx].status = STATUS_OPTIONS[prev];
                                   setSplits(newSplits);
                                 } else if (e.key === 'Enter') {
                                   e.preventDefault();
                                   setActiveDropdown(null);
                                 } else if (e.key === 'Escape') {
                                   setActiveDropdown(null);
                                 }
                               }
                             }}
                             onClick={() => setActiveDropdown(activeDropdown === `split-status-${idx}` ? null : `split-status-${idx}`)}
                           >
                             <span>{split.status || 'Select Status'}</span>
                             <ChevronDown size={14} style={{ color: "var(--cb-primary)" }}/>
                           </div>
                           {activeDropdown === `split-status-${idx}` && (
                             <ul className="neu-dropdown z-50">
                               {STATUS_OPTIONS.map(opt => (
                                 <li 
                                   key={opt}
                                   className="flex justify-between items-center p-2 cursor-pointer transition-colors hover:bg-[#dde3eb]"
                                   style={{ backgroundColor: split.status === opt ? '#dde3eb' : 'transparent' }}
                                   onMouseDown={() => {
                                      const newSplits = [...splits];
                                      newSplits[idx].status = opt;
                                      setSplits(newSplits);
                                      setActiveDropdown(null);
                                   }}
                                 >
                                   {opt}
                                   {split.status === opt && <Check size={14} style={{ color: "var(--cb-primary)" }}/>}
                                 </li>
                               ))}
                             </ul>
                           )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSplits(splits.filter((_, i) => i !== idx))}
                        className="neu-btn neu-btn-danger-action mb-2 p-2 rounded-lg cursor-pointer"
                        title="Remove Split"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSplits([...splits, { bales: '', status: 'Pending Passing' }])}
                    className="mt-2 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    style={{ color: "var(--cb-primary)", backgroundColor: "rgba(74, 127, 196, 0.1)" }}
                  >
                    <Plus size={14} strokeWidth={3} /> Add Split
                  </button>
               </div>
            </div>

            <div className="flex justify-end gap-4 pt-6" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={handleCancel} className="neu-btn neu-btn-cancel-action">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-action">
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
                <tr key={deal.deal_no}>
                  <td className="font-mono font-bold" style={{ color: "var(--cb-primary)" }}>{deal.smart_deal_id}</td>
                  <td>{formatDate(deal.bargain_date)}</td>
                  <td className="font-medium" style={{ color: "var(--cb-text-heading)" }}>{deal.seller_name}</td>
                  <td className="font-medium" style={{ color: "var(--cb-text-heading)" }}>{deal.buyer_name}</td>
                  <td className="font-mono">{deal.bales}</td>
                  <td className="font-mono">{deal.rate}</td>
                  <td className="text-right">
                    <span className="neu-chip" style={{ 
                      color: deal.status === "Approved" ? "var(--cb-success)" : deal.status === "Rejected" ? "#ef4444" : "var(--cb-warning)", 
                      fontSize: "0.7rem",
                      border: `1px solid ${deal.status === "Approved" ? "var(--cb-success)" : deal.status === "Rejected" ? "#ef4444" : "var(--cb-warning)"}`
                    }}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => handleEditClick(deal)}
                      className="neu-btn neu-btn-action" style={{ padding: "0.35rem" }}
                      title="Edit Deal"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => triggerDelete(deal.deal_no, deal.smart_deal_id || deal.deal_no)}
                      className="neu-btn neu-btn-danger-action ml-1" style={{ padding: "0.35rem" }}
                      title="Delete Deal"
                    >
                      <Trash2 size={16} />
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, flattenedBargains.length)} of {flattenedBargains.length} entries
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="neu-btn neu-btn-action px-4 py-1.5"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="neu-btn neu-btn-action px-4 py-1.5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <Toast message={toastMessage} />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
          <div className="bg-cb-bg p-8 rounded-[30px] shadow-neu max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-8">
              Are you sure you want to delete <span className="font-bold text-gray-800">{recordToDelete.displayId}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="neu-btn neu-btn-cancel-action px-6 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="neu-btn neu-btn-danger-action px-6 py-2 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}