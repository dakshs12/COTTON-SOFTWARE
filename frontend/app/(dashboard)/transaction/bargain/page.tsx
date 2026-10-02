"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect, useMemo, useRef } from 'react';
import api from '@/lib/api';
import { Save, Plus, FileText, X, Search, ChevronDown, Check, Edit2, Trash2, Loader2 } from 'lucide-react';
// Import the new Calendar from your existing folder
import CustomDatePicker from '@/app/components/CustomDatePicker';
import { useDropdownKeyboardNav } from '@/app/hooks/useDropdownKeyboardNav';
import posthog from "posthog-js";

// Human-readable labels for all fields
const FIELD_LABELS: Record<string, string> = {
  bargain_date: "Deal Date",
  seller: "Seller",
  buyer: "Buyer",
  station: "Station",
  state: "State",
  bales: "Bales",
  rate: "Rate",
  unit: "Delivery to (Unit)",
  payment_condition: "Payment Condition (Days)",
  payment_by: "Payment By",
  cash_disc: "Cash Discount",
  weight_terms: "Weight Terms",
  delivery_terms: "Delivery Terms",
  delivery_type: "Delivery Type",
  deal_type: "Deal Type",
  cotton_certificate: "Cotton Certificate",
  delivery_from: "Delivery From",
  quality_condition: "Quality Condition",
  advised_by: "Advised By",
  remarks: "Remarks",
  status: "Overall Status",
  splits: "Bales Split",
};

// Formats backend / DRF error responses into clean human-readable text and per-field errors
const parseBackendErrors = (data: any): { formattedMessage: string; errorsByField: Record<string, string> } => {
  const errorsByField: Record<string, string> = {};
  const errorMessages: string[] = [];

  if (!data) {
    return { formattedMessage: "Error saving deal. Please check all fields.", errorsByField };
  }

  if (typeof data === "string") {
    return { formattedMessage: data, errorsByField };
  }

  if (Array.isArray(data)) {
    return { formattedMessage: data.join(", "), errorsByField };
  }

  if (typeof data === "object") {
    if (data.detail && typeof data.detail === "string") {
      return { formattedMessage: data.detail, errorsByField };
    }
    if (data.error && typeof data.error === "string") {
      return { formattedMessage: data.error, errorsByField };
    }

    for (const [field, rawErrors] of Object.entries(data)) {
      const fieldName = FIELD_LABELS[field] || field.replace(/_/g, " ");
      let msg = "";
      if (Array.isArray(rawErrors)) {
        msg = rawErrors.map((e: any) => (typeof e === "string" ? e : JSON.stringify(e))).join(" ");
      } else if (typeof rawErrors === "string") {
        msg = rawErrors;
      } else if (typeof rawErrors === "object" && rawErrors !== null) {
        msg = JSON.stringify(rawErrors);
      }

      let friendlyMsg = msg;
      if (
        /may not be blank/i.test(msg) ||
        /is required/i.test(msg) ||
        /may not be null/i.test(msg) ||
        /cannot be blank/i.test(msg)
      ) {
        friendlyMsg = `${fieldName} cannot be left blank.`;
      } else {
        friendlyMsg = `${fieldName}: ${msg}`;
      }

      errorsByField[field] = friendlyMsg;
      errorMessages.push(friendlyMsg);
    }

    if (errorMessages.length > 0) {
      return {
        formattedMessage: errorMessages.join(" | "),
        errorsByField,
      };
    }
  }

  return { formattedMessage: "Error saving deal. Please check all fields.", errorsByField };
};

const SmartDropdown = ({ 
  label, 
  name, 
  options, 
  placeholder = "Select...", 
  formData, 
  setFormData, 
  activeDropdown, 
  setActiveDropdown,
  error = "",
  clearError
}: any) => {
  const currentValue = (formData as any)[name] || '';
  const isMatched = options.includes(currentValue);
  const filtered = isMatched 
    ? options 
    : options.filter((opt: string) => opt.toLowerCase().includes(currentValue.toLowerCase()));
    
  const isOpen = activeDropdown === name;
  const setIsOpen = (open: boolean) => {
    if (open) {
      setActiveDropdown(name);
    } else {
      setActiveDropdown((prev: any) => prev === name ? null : prev);
    }
  };

  const handleSelect = (opt: string) => {
    setFormData({ ...formData, [name]: opt });
    if (clearError) clearError(name);
    setActiveDropdown(null);
  };

  const { highlightedIndex, handleKeyDown, listRef } = useDropdownKeyboardNav(filtered, isOpen, setIsOpen, handleSelect);

  return (
      <div className="relative">
        <label className="neu-label">
          {label}
        </label>
        <div className="relative">
           <input 
             name={name}
             value={(formData as any)[name]}
             onChange={(e) => {
               setFormData({ ...formData, [name]: e.target.value });
               if (clearError) clearError(name);
             }}
             onFocus={() => setIsOpen(true)}
             onBlur={() => setTimeout(() => setIsOpen(false), 200)}
             onKeyDown={handleKeyDown}
             className={`neu-input cursor-pointer pr-10 ${error ? '!border-red-500 !ring-1 !ring-red-400' : ''}`}
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
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success', duration?: number) => {
    setToastMessage({ text: msg, type });
    const timer = duration || (type === 'error' ? 5000 : 3000);
    setTimeout(() => setToastMessage(null), timer);
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
  const certificateOptions = useMemo(() => getLearnedOptions('cotton_certificate', CERTIFICATE_OPTIONS), [bargains]);
  
  const stateOptions = useMemo(() => {
    const usedStates = parties.map(p => p.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [parties]);

  const initialFormState = {
    bargain_date: new Date().toISOString().split('T')[0],
    seller: '', buyer: '', state: '', station: '',
    bales: '', rate: '', unit: '',
    payment_condition: '', payment_by: '',
    cash_disc: '', weight_terms: '', delivery_terms: '',
    delivery_type: '', delivery_from: '',
    deal_type: '', cotton_certificate: 'N.A.',
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
        api.get('parties/lite/')
      ]);
      setBargains(bargainRes.data);
      setParties(partyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
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
    if (fieldErrors.bargain_date) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.bargain_date;
        return next;
      });
    }
    setFormData({ ...formData, bargain_date: val });
  };

  const handleAutoSelect = (name: string, val: string) => {
    setFormData({ ...formData, [name]: val });
    setActiveDropdown(null);
  };

  const handlePartySelect = (type: 'seller' | 'buyer', partyId: string, partyName: string, partyStation: string, partyState: string) => {
    if (fieldErrors[type]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    }
    if (type === 'seller') {
      if (fieldErrors.station && partyStation) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.station;
          return next;
        });
      }
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
    setFieldErrors({});
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
    setFieldErrors({});
    setSellerSearch("");
    setBuyerSearch("");
    setSplits([]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Prevent duplicate submission if request is already in flight
    if (isSubmittingRef.current) return;

    // Client-side validation: Check compulsory fields
    const clientErrors: Record<string, string> = {};

    if (!formData.bargain_date) {
      clientErrors.bargain_date = "Bargain Date cannot be left blank.";
    }
    if (!formData.seller) {
      clientErrors.seller = "Seller cannot be left blank.";
    }
    if (!formData.buyer) {
      clientErrors.buyer = "Buyer cannot be left blank.";
    }
    if (!formData.station || !formData.station.trim()) {
      clientErrors.station = "Station cannot be left blank.";
    }
    if (!formData.bales || parseInt(formData.bales) <= 0) {
      clientErrors.bales = "Bales must be greater than 0.";
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      clientErrors.rate = "Rate must be greater than 0.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const errorsList = Object.values(clientErrors);
      if (errorsList.length === 1) {
        showToast(errorsList[0], 'error');
      } else {
        showToast(`Compulsory fields missing: ${errorsList.join(" | ")}`, 'error');
      }
      return;
    }

    // Data Cleaning: Convert strings to numbers
    const payload: any = {
      ...formData,
      bales: formData.bales ? parseInt(formData.bales) : 0,
      rate: formData.rate ? parseFloat(formData.rate) : 0,
      payment_condition: formData.payment_condition ? parseInt(formData.payment_condition) : null,
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

    // Synchronously lock submission so rapid 2nd/3rd clicks do nothing
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (editingId) {
        const res = await api.put(`bargains/${editingId}/`, payload);
        posthog.capture("bargain_deal_updated", {
          deal_id: editingId,
          bales: payload.bales,
          rate: payload.rate,
          deal_type: payload.deal_type,
          delivery_type: payload.delivery_type,
          status: payload.status,
        });
        showToast('Deal Updated Successfully!');
        if (res.data) {
          setBargains(prev => prev.map(b => (b.deal_no === editingId || b.id === editingId) ? res.data : b));
        }
      } else {
        const res = await api.post('bargains/', payload);
        posthog.capture("bargain_deal_created", {
          bales: payload.bales,
          rate: payload.rate,
          deal_type: payload.deal_type,
          delivery_type: payload.delivery_type,
          status: payload.status,
        });
        showToast('Deal Saved Successfully!');
        if (res.data) {
          setBargains(prev => [res.data, ...prev.filter(b => b.deal_no !== res.data.deal_no && b.id !== res.data.id)]);
        }
      }
      setIsFormOpen(false);
      setEditingId(null);
      // Reset form
      setFormData(initialFormState);
      setFieldErrors({});
      setSellerSearch("");
      setBuyerSearch("");
      setSplits([]);

      // Non-blocking background sync for full consistency (backend already sends latest first)
      api.get('bargains/').then(r => setBargains(r.data)).catch(console.error);
    } catch (error: any) {
      console.error("Error saving deal:", error);
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        showToast('Network error: Unable to connect to server. Please check connection.', 'error');
      } else {
        const { formattedMessage, errorsByField } = parseBackendErrors(error.response?.data);
        setFieldErrors(errorsByField);
        showToast(formattedMessage, 'error');
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
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
      posthog.capture("bargain_deal_deleted", { deal_id: recordToDelete.id });
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
    return (
      <SmartDropdown 
        label={label} 
        name={name} 
        options={options} 
        placeholder={placeholder} 
        formData={formData} 
        setFormData={setFormData} 
        activeDropdown={activeDropdown} 
        setActiveDropdown={setActiveDropdown}
        error={fieldErrors[name]}
        clearError={(f: string) => {
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next[f];
            return next;
          });
        }}
      />
    );
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
  const filteredBargains = useMemo(() => {
    return bargains
      .slice()
      .sort((a, b) => (Number(b.deal_no || b.id) || 0) - (Number(a.deal_no || a.id) || 0))
      .filter(deal => {
        const matchesSearch = 
          (deal.smart_deal_id && deal.smart_deal_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (deal.buyer_name && deal.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (deal.seller_name && deal.seller_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
  }, [bargains, searchTerm, statusFilter]);

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
            onClick={handleCancel}
            disabled={isSubmitting}
            className="neu-btn neu-btn-cancel-action absolute top-5 right-5 p-2 rounded-full cursor-pointer disabled:opacity-50"
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
                      onChange={(e) => { 
                        setSellerSearch(e.target.value); 
                        setIsSellerDropdownOpen(true); 
                        if (fieldErrors.seller) {
                          setFieldErrors(prev => { const n = { ...prev }; delete n.seller; return n; });
                        }
                      }}
                      onFocus={() => setIsSellerDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsSellerDropdownOpen(false), 200)}
                      onKeyDown={handleSellerKeyDown}
                      placeholder="Search..."
                      className={`neu-input cursor-pointer ${fieldErrors.seller ? '!border-red-500 !ring-1 !ring-red-400' : ''}`}
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
                    {fieldErrors.seller && <p className="text-xs text-red-500 mt-1">{fieldErrors.seller}</p>}
                </div>
                
                <div className="col-span-1 relative">
                    <label className="neu-label">Buyer</label>
                    <input
                      type="text"
                      value={buyerSearch}
                      onChange={(e) => { 
                        setBuyerSearch(e.target.value); 
                        setIsBuyerDropdownOpen(true); 
                        if (fieldErrors.buyer) {
                          setFieldErrors(prev => { const n = { ...prev }; delete n.buyer; return n; });
                        }
                      }}
                      onFocus={() => setIsBuyerDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsBuyerDropdownOpen(false), 200)}
                      onKeyDown={handleBuyerKeyDown}
                      placeholder="Search..."
                      className={`neu-input cursor-pointer ${fieldErrors.buyer ? '!border-red-500 !ring-1 !ring-red-400' : ''}`}
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
                    {fieldErrors.buyer && <p className="text-xs text-red-500 mt-1">{fieldErrors.buyer}</p>}
                </div>
                
                <div className="col-span-1">
                   <label className="neu-label">Station</label>
                   <input 
                     name="station" 
                     value={formData.station} 
                     onChange={handleChange} 
                     className={`neu-input ${fieldErrors.station ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.station && <p className="text-xs text-red-500 mt-1">{fieldErrors.station}</p>}
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
                     className={`neu-input font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${fieldErrors.bales ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.bales && <p className="text-xs text-red-500 mt-1">{fieldErrors.bales}</p>}
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
                     className={`neu-input font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${fieldErrors.rate ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.rate && <p className="text-xs text-red-500 mt-1">{fieldErrors.rate}</p>}
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
                     className={`neu-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${fieldErrors.payment_condition ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.payment_condition && <p className="text-xs text-red-500 mt-1">{fieldErrors.payment_condition}</p>}
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
                   <label className="neu-label mr-2" style={{ marginBottom: 0, fontSize: "0.8rem" }}>
                     Weight Terms:
                   </label>
                   <label
                     className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all duration-150"
                     style={{
                       background: formData.weight_terms === 'Mill Weight' ? 'rgba(74, 127, 196, 0.08)' : 'transparent',
                       border: formData.weight_terms === 'Mill Weight' ? '1px solid rgba(74, 127, 196, 0.2)' : '1px solid transparent',
                       borderRadius: "var(--cb-radius-sm)",
                     }}
                   >
                      <input 
                        type="radio" 
                        name="weight_terms" 
                        value="Mill Weight" 
                        checked={formData.weight_terms === 'Mill Weight'} 
                        onChange={handleChange}
                        onClick={() => {
                          if (formData.weight_terms === 'Mill Weight') {
                            setFormData(prev => ({ ...prev, weight_terms: '' }));
                          }
                        }}
                        className="w-4 h-4 cursor-pointer accent-[#4a7fc4]"
                      />
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
                      <input 
                        type="radio" 
                        name="weight_terms" 
                        value="Spot Weight" 
                        checked={formData.weight_terms === 'Spot Weight'} 
                        onChange={handleChange}
                        onClick={() => {
                          if (formData.weight_terms === 'Spot Weight') {
                            setFormData(prev => ({ ...prev, weight_terms: '' }));
                          }
                        }}
                        className="w-4 h-4 cursor-pointer accent-[#4a7fc4]"
                      />
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
                   <input 
                     name="delivery_from" 
                     value={formData.delivery_from} 
                     onChange={handleChange} 
                     className={`neu-input ${fieldErrors.delivery_from ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.delivery_from && <p className="text-xs text-red-500 mt-1">{fieldErrors.delivery_from}</p>}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Delivery to (Unit)</label>
                   <input 
                     name="unit" 
                     value={formData.unit} 
                     onChange={handleChange} 
                     className={`neu-input ${fieldErrors.unit ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.unit && <p className="text-xs text-red-500 mt-1">{fieldErrors.unit}</p>}
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Advised By</label>
                   <input 
                     name="advised_by" 
                     value={formData.advised_by} 
                     onChange={handleChange} 
                     className={`neu-input ${fieldErrors.advised_by ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                   />
                   {fieldErrors.advised_by && <p className="text-xs text-red-500 mt-1">{fieldErrors.advised_by}</p>}
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
                  <textarea 
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleChange} 
                    className={`neu-input ${fieldErrors.remarks ? '!border-red-500 !ring-1 !ring-red-400' : ''}`} 
                    style={{ height: "64px", resize: "none" }} 
                  />
                  {fieldErrors.remarks && <p className="text-xs text-red-500 mt-1">{fieldErrors.remarks}</p>}
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
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={isSubmitting}
                className="neu-btn neu-btn-cancel-action disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="neu-btn neu-btn-action disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[130px] gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{editingId ? "Updating..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{editingId ? "Update Deal" : "Save Deal"}</span>
                  </>
                )}
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
                    <span className="neu-chip whitespace-nowrap" style={{ 
                      color: deal.status === "Approved" ? "var(--cb-success)" : deal.status === "Rejected" ? "#ef4444" : "var(--cb-warning)", 
                      fontSize: "0.7rem",
                      border: `1px solid ${deal.status === "Approved" ? "var(--cb-success)" : deal.status === "Rejected" ? "#ef4444" : "var(--cb-warning)"}`
                    }}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
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