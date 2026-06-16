"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Truck, X, ChevronDown, Search, Edit2 } from 'lucide-react';
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

  const [isDirectDelivery, setIsDirectDelivery] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Table Pagination & Search State
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const initialFormState = {
    bargain: '', passing: '',
    bill_no: '', bill_date: new Date().toISOString().split('T')[0],
    truck_no: '', transport_name: '',
    quantity_bales: 0, rate: 0, net_weight: 0,
    cotton_value: 0, gst_percent: 5, gst_amount: 0, total_bill_amount: 0,
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const [displayInfo, setDisplayInfo] = useState({ seller: '', buyer: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [delRes, passRes, barRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/deliveries/'),
        axios.get('http://127.0.0.1:8000/api/passings/'),
        axios.get('http://127.0.0.1:8000/api/bargains/')
      ]);
      setDeliveries(delRes.data);
      setPassings(passRes.data);
      setBargains(barRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    if (['quantity_bales', 'net_weight', 'gst_percent', 'rate'].includes(name)) {
      calculateTotals(newData);
    }
  };

  const calculateTotals = (data: any) => {
    const bales = parseFloat(data.quantity_bales) || 0;
    const rate = parseFloat(data.rate) || 0;
    const gst = parseFloat(data.gst_percent) || 0;

    const baseValue = bales * rate; 
    const gstAmt = (baseValue * gst) / 100;
    const total = baseValue + gstAmt;

    setFormData(prev => ({
      ...prev,
      cotton_value: parseFloat(baseValue.toFixed(2)),
      gst_amount: parseFloat(gstAmt.toFixed(2)),
      total_bill_amount: parseFloat(total.toFixed(2))
    }));
  };

  const handleSelection = (item: any) => {
    if (isDirectDelivery) {
      setFormData({ ...formData, bargain: item.deal_no, passing: '', rate: item.rate });
      setDisplayInfo({ seller: item.seller_name, buyer: item.buyer_name });
      setSearchTerm(item.smart_deal_id);
    } else {
      setFormData({ ...formData, bargain: item.deal_no, passing: item.id, rate: item.rate || 0 }); 
      setDisplayInfo({ seller: item.seller_name, buyer: item.buyer_name });
      setSearchTerm(`Passing #${item.passing_no}`);
    }
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
    // We don't have full party names directly unless we find them from bargains
    const matchedBargain = bargains.find(b => b?.id?.toString() === del.bargain?.toString() || b?.deal_no === del.bargain);
    if (matchedBargain) {
      setDisplayInfo({ seller: matchedBargain.seller_name, buyer: matchedBargain.buyer_name });
    }
    
    setEditingId(del.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setSearchTerm("");
    setDisplayInfo({ seller: '', buyer: '' });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.passing) delete (payload as any).passing; 

      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/deliveries/${editingId}/`, payload);
        alert('Delivery Updated!');
      } else {
        await axios.post('http://127.0.0.1:8000/api/deliveries/', payload);
        alert('Delivery Saved!');
      }
      setIsFormOpen(false);
      setEditingId(null);
      fetchData();
      setFormData(initialFormState);
      setSearchTerm("");
      setDisplayInfo({ seller: '', buyer: '' });
    } catch (error) {
      console.error("Error saving:", error);
      alert('Error saving data.');
    }
  };

  const getFilteredOptions = () => {
    if (isDirectDelivery) {
      return bargains.filter(b => 
        (b.smart_deal_id && b.smart_deal_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.seller_name && b.seller_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return passings.filter(p => 
      (p.passing_no && p.passing_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.deal_no && p.deal_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Delivery Details</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Generate bills and track logistics.
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="neu-btn neu-btn-primary">
          <Plus size={18} /> New Delivery
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
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      placeholder={isDirectDelivery ? "Search Deal No..." : "Search Passing No..."}
                      className="neu-input cursor-pointer pr-10"
                    />
                    <ChevronDown size={16} className="absolute right-3 top-3 pointer-events-none" style={{ color: "var(--cb-primary)" }}/>
                    {isDropdownOpen && (
                      <ul className="neu-dropdown z-50">
                        {getFilteredOptions().map((item: any) => (
                          <li key={item.id || item.deal_no} onMouseDown={() => handleSelection(item)}>
                            {isDirectDelivery ? (
                                <span><span className="font-bold" style={{ color: "var(--cb-primary)" }}>{item.smart_deal_id}</span> - {item.seller_name}</span>
                            ) : (
                                <span><span className="font-bold" style={{ color: "var(--cb-secondary)" }}>{item.passing_no}</span> (Deal: {item.deal_no})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
               </div>
               <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-text-placeholder)" }}>Seller</label>
                 <div className="font-semibold" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.seller || "-"}</div>
               </div>
               <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-text-placeholder)" }}>Buyer</label>
                 <div className="font-semibold" style={{ color: "var(--cb-text-heading)" }}>{displayInfo.buyer || "-"}</div>
               </div>
            </div>

            {/* --- Logistics --- */}
            <div className="col-span-1">
               <label className="neu-label">Bill / Invoice No</label>
               <input name="bill_no" value={formData.bill_no} onChange={handleChange} className="neu-input" required />
            </div>
            
            <div className="col-span-1">
               {/* CUSTOM CALENDAR */}
               <CustomDatePicker 
                  label="Bill Date" 
                  value={formData.bill_date} 
                  onChange={(val) => setFormData({...formData, bill_date: val})} 
               />
            </div>

            <div className="col-span-1">
               <label className="neu-label">Truck No</label>
               <input name="truck_no" value={formData.truck_no} onChange={handleChange} className="neu-input" required />
            </div>
            <div className="col-span-1">
               <label className="neu-label">Transport Name</label>
               <input name="transport_name" value={formData.transport_name} onChange={handleChange} className="neu-input" />
            </div>

            {/* --- Calculation --- */}
            <div
              className="md:col-span-4 grid grid-cols-1 md:grid-cols-5 gap-4 p-5 rounded-xl mt-2"
              style={{ borderTop: "1px solid var(--cb-divider)", background: "rgba(90, 143, 74, 0.04)", border: "1px solid rgba(90, 143, 74, 0.12)", borderRadius: "var(--cb-radius-lg)" }}
            >
                <div className="col-span-1">
                    <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Bales</label>
                    <input type="number" name="quantity_bales" value={formData.quantity_bales} onChange={handleChange} className="neu-input font-mono" />
                </div>
                <div className="col-span-1">
                    <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Rate</label>
                    <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="neu-input font-mono" />
                </div>
                 <div className="col-span-1">
                    <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Cotton Value</label>
                    <input
                      value={formData.cotton_value}
                      readOnly
                      className="neu-input font-mono font-bold"
                      style={{ background: "rgba(90, 143, 74, 0.06)" }}
                    />
                </div>
                 <div className="col-span-1">
                    <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>GST (5%)</label>
                    <input
                      value={formData.gst_amount}
                      readOnly
                      className="neu-input font-mono"
                      style={{ background: "rgba(90, 143, 74, 0.06)" }}
                    />
                </div>
                 <div className="col-span-1">
                    <label className="neu-label" style={{ color: "var(--cb-secondary)" }}>Total Bill</label>
                    <input
                      value={formData.total_bill_amount}
                      readOnly
                      className="neu-input font-mono text-lg font-bold"
                      style={{ background: "rgba(90, 143, 74, 0.1)", color: "var(--cb-secondary)" }}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={handleCancel} className="neu-btn">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-primary">
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
                      className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-100 text-gray-500 hover:text-[#4a7fc4]"
                      title="Edit Delivery"
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} of {filteredDeliveries.length} entries
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