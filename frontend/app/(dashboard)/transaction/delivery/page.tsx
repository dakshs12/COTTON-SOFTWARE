"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Save, Plus, X, Search, CheckCircle, Edit2, Trash2, ChevronDown, FileText, Truck, RefreshCw } from 'lucide-react';
import { useDropdownKeyboardNav } from '@/app/hooks/useDropdownKeyboardNav';
// Import the Custom Calendar
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

export default function DeliveryEntryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [passings, setPassings] = useState<any[]>([]);
  const [bargains, setBargains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{id: number, displayId: string} | null>(null);

  const [isDirectDelivery, setIsDirectDelivery] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Table Pagination & Search State
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialFormState = {
    bargain: '', passing: '',
    bill_no: '', bill_date: new Date().toISOString().split('T')[0],
    truck_no: '',
    lr_no: '',
    transport_name: '',
    quantity_bales: 0, rate: 0, net_weight: 0,
    cotton_value: 0, gst_amount: 0,
    total_bill_amount: 0,
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const [displayInfo, setDisplayInfo] = useState({ seller: '', buyer: '', station: '', lot_no: '', bargain_no: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [delRes, passRes, barRes] = await Promise.all([
        api.get('deliveries/'),
        api.get('passings/'),
        api.get('bargains/')
      ]);
      setDeliveries(delRes.data.reverse());
      setPassings(passRes.data.reverse());
      setBargains(barRes.data.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    if (['quantity_bales', 'rate', 'net_weight'].includes(name)) {
      calculateTotals(newData);
    }
  };

  const calculateTotals = (data: any) => {
    const bales = parseFloat(data.quantity_bales) || 0;
    const rate = parseFloat(data.rate) || 0;
    const netWeight = parseFloat(data.net_weight) || 0;
    const baseValue = rate * 0.2812 * netWeight; 
    const gstAmt = (baseValue * 5) / 100; // Fixed 5% GST
    const total = baseValue + gstAmt;

    setFormData(prev => ({
      ...prev,
      cotton_value: parseFloat(baseValue.toFixed(2)),
      gst_amount: parseFloat(gstAmt.toFixed(2)),
      total_bill_amount: parseFloat(total.toFixed(2))
    }));
  };

  const handleSelection = (item: any) => {
    let seller = '', buyer = '', station = '', lotNo = '', bargainNo = '';
    
    if (isDirectDelivery) {
      const newData = { ...formData, bargain: item.id, passing: '', rate: item.rate, quantity_bales: item.bales };
      setFormData(newData);
      calculateTotals(newData);
      seller = item.seller_name;
      buyer = item.buyer_name;
      station = item.station;
      bargainNo = item.smart_deal_id;
      setSearchTerm(item.smart_deal_id);
    } else {
      let bales = item.bales || formData.quantity_bales;
      let rate = item.deal_rate || formData.rate;
      let dealSmartId = item.deal_no;
      const matchedBargain = bargains.find(b => b?.id?.toString() === item.bargain?.toString() || b?.deal_no === item.bargain);
      if (matchedBargain) {
        station = matchedBargain.station;
        bargainNo = matchedBargain.smart_deal_id || bargainNo;
        rate = matchedBargain.rate || rate;
        dealSmartId = matchedBargain.smart_deal_id || dealSmartId;
      }

      const newData = { ...formData, bargain: item.bargain, passing: item.id, rate, quantity_bales: bales };
      setFormData(newData);
      calculateTotals(newData);
      seller = item.seller_name;
      buyer = item.buyer_name;
      lotNo = item.lot_no;
      bargainNo = item.book_bargain_no || ''; 
      
      setSearchTerm(dealSmartId);
    }
    
    setDisplayInfo({ seller, buyer, station, lot_no: lotNo, bargain_no: bargainNo });
    setIsDropdownOpen(false);
  };

  const handleEditClick = (del: any) => {
    // If it's a direct delivery, passing_ref might be empty
    setIsDirectDelivery(!del.passing);
    
    // Replace nulls with empty strings to avoid React uncontrolled input warnings
    const sanitizedDel = Object.fromEntries(
      Object.entries(del).map(([k, v]) => [k, v === null ? '' : v])
    );
    
    setFormData({
      ...initialFormState,
      ...sanitizedDel,
      bargain: sanitizedDel.bargain?.toString() || '',
      passing: sanitizedDel.passing?.toString() || '',
      bill_date: sanitizedDel.bill_date || initialFormState.bill_date,
    });
    
    setSearchTerm(del.deal_display || `Delivery #${del.id}`);
    let seller = '', buyer = '', station = '', lotNo = '', bargainNo = '';
    if (!del.passing) {
      bargainNo = del.deal_display;
    } else {
      const matchedPassing = passings.find(p => p.id === del.passing);
      if (matchedPassing) {
        lotNo = matchedPassing.lot_no;
        bargainNo = matchedPassing.book_bargain_no || '';
      }
    }

    const matchedBargain = bargains.find(b => b?.id?.toString() === del.bargain?.toString() || b?.deal_no === del.bargain);
    if (matchedBargain) {
      seller = matchedBargain.seller_name;
      buyer = matchedBargain.buyer_name;
      station = matchedBargain.station;
    }
    setDisplayInfo({ seller, buyer, station, lot_no: lotNo, bargain_no: bargainNo });
    
    setEditingId(del.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setSearchTerm("");
    setDisplayInfo({ seller: '', buyer: '', station: '', lot_no: '', bargain_no: '' });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload: any = { 
        ...formData,
        quantity_bales: parseInt(formData.quantity_bales as any) || 0,
        rate: parseFloat(formData.rate as any) || 0,
        net_weight: parseFloat(formData.net_weight as any) || 0,
        cotton_value: parseFloat(formData.cotton_value as any) || 0,
        gst_amount: parseFloat(formData.gst_amount as any) || 0,
        total_bill_amount: parseFloat(formData.total_bill_amount as any) || 0
      };
      
      delete payload.created_at;
      delete payload.updated_at;
      delete payload.deleted_at;

      if (!payload.passing) delete payload.passing; 

      if (editingId) {
        await api.put(`deliveries/${editingId}/`, payload);
        showToast('Delivery Updated Successfully!');
      } else {
        await api.post('deliveries/', payload);
        showToast('Delivery Saved Successfully!');
      }
      setIsFormOpen(false);
      setEditingId(null);
      fetchData();
      setFormData(initialFormState);
      setSearchTerm("");
      setDisplayInfo({ seller: '', buyer: '', station: '', lot_no: '', bargain_no: '' });
    } catch (error: any) {
      console.error("Error saving:", error);
      if (error.response && error.response.data) {
        showToast(`Error: ${JSON.stringify(error.response.data, 'error')}`);
      } else {
        showToast('Error saving data. Please check fields.', 'error');
      }
    }
  };

  const getFilteredOptions = () => {
    if (isDirectDelivery) {
      const isMatched = bargains.some(b => `Deal: ${b.smart_deal_id || b.deal_no} | ${b.seller_name}` === searchTerm);
      return bargains.filter(b => 
        isMatched || 
        (b.smart_deal_id && b.smart_deal_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.seller_name && b.seller_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    const isMatched = passings.some(p => `Passing: ${p.pr_no || p.passing_no} | Deal: ${p.deal_no}` === searchTerm);
    return passings.filter(p => 
      isMatched ||
      (p.passing_no && p.passing_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.deal_no && p.deal_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const { highlightedIndex, handleKeyDown, listRef } = useDropdownKeyboardNav(
    getFilteredOptions(),
    isDropdownOpen,
    setIsDropdownOpen,
    handleSelection
  );

  const triggerDelete = (id: number, displayId: string) => {
    setRecordToDelete({ id, displayId });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await api.delete(`deliveries/${recordToDelete.id}/`);
      showToast('Delivery Deleted Successfully!');
      fetchData();
      setDeleteModalOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Error deleting delivery:", error);
      showToast('Error deleting delivery.', 'error');
    }
  };

  // --- Filter & Pagination Logic ---
  const filteredDeliveries = deliveries.filter(del => 
    (del.bill_no && del.bill_no.toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
    (del.truck_no && del.truck_no.toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
    (del.deal_display && del.deal_display.toLowerCase().includes(tableSearchTerm.toLowerCase())) ||
    (del.passing_ref && del.passing_ref.toLowerCase().includes(tableSearchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const currentDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto neu-fade-in">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4a7fc4] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 neu-fade-in font-medium tracking-wide">
          <CheckCircle size={20} />
          {toastMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Delivery Details</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Generate bills and track logistics.
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="neu-btn neu-btn-action">
          <Plus size={18} /> New Delivery
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
          
          <div className="flex items-center gap-4 mb-6 pb-3" style={{ borderBottom: "2px solid var(--cb-divider)" }}>
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{
                color: "var(--cb-text-heading)",
                fontFamily: "var(--font-playfair-display), 'Playfair Display', serif",
              }}
            >
              <Truck size={20} style={{ color: "var(--cb-primary)" }}/> Delivery Entry
            </h2>
            
            {/* Direct Delivery Toggle */}
            <label
              className="flex items-center gap-2 text-sm cursor-pointer px-3 py-1.5 rounded-full transition-all duration-150"
              style={{
                background: isDirectDelivery ? "rgba(74, 127, 196, 0.08)" : "#dde3eb",
                border: isDirectDelivery ? "1px solid rgba(74, 127, 196, 0.2)" : "1px solid transparent",
                borderRadius: "var(--cb-radius-pill)",
              }}
            >
              <input
                type="checkbox"
                checked={isDirectDelivery}
                onChange={() => { setIsDirectDelivery(!isDirectDelivery); setSearchTerm(""); }}
                className="rounded cursor-pointer accent-[#4a7fc4]"
              />
              <span className="font-semibold" style={{ color: "var(--cb-text-body)" }}>Direct Delivery (Skip Passing)</span>
            </label>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Search Section --- */}
            <div className="md:col-span-4 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 neu-pressed">
               <div className="col-span-1 relative">
                  <label className="neu-label" style={{ color: "var(--cb-primary)" }}>
                    {isDirectDelivery ? "Select Bargain" : "Select Passing"}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsDropdownOpen((prev) => (prev ? false : prev));
                        }, 200);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={isDirectDelivery ? "Search Deal No..." : "Search Passing No..."}
                      className="neu-input cursor-pointer pr-10"
                    />
                    <ChevronDown size={16} className="absolute right-3 top-3 pointer-events-none" style={{ color: "var(--cb-primary)" }}/>
                    {isDropdownOpen && (
                      <ul className="neu-dropdown z-50" ref={listRef as React.RefObject<HTMLUListElement>}>
                        {getFilteredOptions().map((item: any, idx: number) => {
                          let bargainDate = "";
                          if (isDirectDelivery) {
                             bargainDate = item.bargain_date;
                          } else {
                             const matchedBargain = bargains.find(b => b?.id?.toString() === item.bargain?.toString() || b?.deal_no === item.bargain);
                             if (matchedBargain) bargainDate = matchedBargain.bargain_date;
                          }
                          
                          return (
                            <li 
                              key={item.id || item.deal_no} 
                              onMouseDown={() => handleSelection(item)}
                              style={highlightedIndex === idx ? { backgroundColor: '#dde3eb' } : {}}
                            >
                              <div className="w-full overflow-hidden">
                                <div className="flex justify-between items-center w-full">
                                  {isDirectDelivery ? (
                                    <span className="font-bold truncate" style={{ color: "var(--cb-primary)" }}>{item.smart_deal_id}</span>
                                  ) : (
                                    <span className="font-bold truncate" style={{ color: "var(--cb-secondary)" }}>{item.deal_no}</span>
                                  )}
                                  <span className="text-xs whitespace-nowrap pl-2" style={{ color: "var(--cb-text-label)" }}>{formatDate(bargainDate)}</span>
                                </div>
                                <span className="text-xs block truncate mt-1" style={{ color: "var(--cb-text-label)" }}>
                                  {`${item.seller_name} ➔ ${item.buyer_name}`}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
               </div>
               
               {/* Display Info Grid */}
               <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4 mt-2 p-4 rounded-lg" style={{ background: "rgba(74, 127, 196, 0.05)" }}>
                 <div>
                   <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--cb-text-placeholder)" }}>Seller</label>
                   <div className="text-sm font-semibold truncate" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.seller || "-"}</div>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--cb-text-placeholder)" }}>Buyer</label>
                   <div className="text-sm font-semibold truncate" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.buyer || "-"}</div>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--cb-text-placeholder)" }}>Station</label>
                   <div className="text-sm font-semibold truncate" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.station || "-"}</div>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--cb-text-placeholder)" }}>Lot No.</label>
                   <div className="text-sm font-semibold truncate" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.lot_no || "-"}</div>
                 </div>
                 <div>
                   <label className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--cb-text-placeholder)" }}>Bargain No. / PO No.</label>
                   <div className="text-sm font-semibold truncate" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.bargain_no || "-"}</div>
                 </div>
               </div>
            </div>

            {/* --- Order: BILL NO, BILL DATE, BALES, RATE, NET WEIGHT, COTTON VALUE, GST, BILL AMOUNT --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-1">
                 <label className="neu-label">Bill / Invoice No</label>
                 <input name="bill_no" value={formData.bill_no} onChange={handleChange} className="neu-input" required />
              </div>
              
              <div className="col-span-1">
                 <CustomDatePicker 
                    label="Bill Date" 
                    value={formData.bill_date} 
                    onChange={(val) => setFormData({...formData, bill_date: val})} 
                 />
              </div>

              <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Bales</label>
                 <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} name="quantity_bales" value={formData.quantity_bales} onChange={handleChange} className="neu-input font-mono" />
              </div>

              <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Rate</label>
                 <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} name="rate" value={formData.rate} onChange={handleChange} className="neu-input font-mono" />
              </div>

              <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Net Weight</label>
                 <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} name="net_weight" value={formData.net_weight} onChange={handleChange} className="neu-input font-mono" />
              </div>

              <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Cotton Value</label>
                 <input
                   value={formData.cotton_value}
                   readOnly
                   className="neu-input font-mono bg-gray-50"
                   style={{ color: "var(--cb-text-body)" }}
                   disabled
                 />
              </div>

              <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>GST (5%)</label>
                 <input
                   value={formData.gst_amount}
                   readOnly
                   className="neu-input font-mono bg-gray-50"
                   style={{ color: "var(--cb-text-body)" }}
                   disabled
                 />
              </div>

              <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Bill Amount</label>
                 <input
                   value={formData.total_bill_amount}
                   readOnly
                   className="neu-input font-mono font-bold"
                   style={{ background: "rgba(90, 143, 74, 0.1)", color: "var(--cb-success)", border: "1px solid rgba(90, 143, 74, 0.2)" }}
                 />
              </div>
            </div>

            {/* --- Transportation Details --- */}
            <div className="md:col-span-4 pt-6 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
               <h3 className="neu-section-title mb-4 flex items-center gap-2">
                 <Truck size={18}/> Transportation Details
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="col-span-1">
                    <label className="neu-label">Truck No</label>
                    <input name="truck_no" value={formData.truck_no} onChange={handleChange} className="neu-input" required />
                 </div>
                 <div className="col-span-1">
                    <label className="neu-label">LR No</label>
                    <input name="lr_no" value={formData.lr_no} onChange={handleChange} className="neu-input" />
                 </div>
                 <div className="col-span-1">
                    <label className="neu-label">Transport Name</label>
                    <input name="transport_name" value={formData.transport_name} onChange={handleChange} className="neu-input" />
                 </div>
               </div>
            </div>

            {/* --- Remarks --- */}
            <div className="md:col-span-4 pt-6 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <label className="neu-label">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="neu-input" style={{ height: "64px", resize: "none" }} />
            </div>

            <div className="md:col-span-4 flex justify-end gap-4 pt-6" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={handleCancel} className="neu-btn neu-btn-cancel-action">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-action">
                <Save size={18} /> {editingId ? "Update Delivery" : "Save Delivery"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table */}
      <div className="neu-card p-2 sm:p-4 mt-8">
        <div className="p-3 mb-2 flex justify-between items-center flex-wrap gap-4">
          <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Recent Deliveries</h3>
          <div className="relative">
             <Search className="absolute right-3 top-2.5" size={16} style={{ color: "var(--cb-text-label)" }} />
             <input 
               type="text" 
               placeholder="Search bill, truck, deal..." 
               className="neu-input pl-4 pr-9 py-2" 
               style={{ width: "240px" }}
               value={tableSearchTerm}
               onChange={(e) => {
                 setTableSearchTerm(e.target.value);
                 setCurrentPage(1);
               }}
             />
           </div>
        </div>
        <div className="overflow-x-auto" style={{ borderRadius: "12px" }}>
          <table className="neu-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Deal / Passing</th>
                <th>Truck No</th>
                <th>Bales</th>
                <th className="text-right">Bill Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading...</td></tr>
              ) : currentDeliveries.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>No deliveries found.</td></tr>
              ) : currentDeliveries.map((del) => (
                <tr key={del.id}>
                  <td className="font-bold" style={{ color: "var(--cb-text-heading)" }}>{del.bill_no}</td>
                  <td>{formatDate(del.bill_date)}</td>
                  <td className="text-xs">
                    <div className="font-bold" style={{ color: "var(--cb-primary)" }}>{del.deal_display}</div>
                    {del.passing_ref ? (
                      <div style={{ color: "var(--cb-secondary)" }}>Ref: {del.passing_ref}</div>
                    ) : (
                      <div className="italic" style={{ color: "var(--cb-warning)" }}>Direct</div>
                    )}
                  </td>
                  <td className="font-mono">{del.truck_no}</td>
                  <td className="font-mono">{del.quantity_bales}</td>
                  <td className="text-right font-bold" style={{ color: "var(--cb-secondary)" }}>₹{del.total_bill_amount}</td>
                  <td className="text-right">
                    <button 
                      onClick={() => handleEditClick(del)}
                      className="neu-btn neu-btn-action" style={{ padding: "0.35rem" }}
                      title="Edit Delivery"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => triggerDelete(del.id, del.bill_no || del.deal_display || String(del.id))}
                      className="neu-btn neu-btn-danger-action ml-1" style={{ padding: "0.35rem" }}
                      title="Delete Delivery"
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} of {filteredDeliveries.length} entries
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