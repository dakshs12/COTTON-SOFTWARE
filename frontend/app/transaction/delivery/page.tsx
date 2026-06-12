"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Truck, X, ChevronDown } from 'lucide-react';
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

  const [isDirectDelivery, setIsDirectDelivery] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    bargain: '', passing: '',
    bill_no: '', bill_date: new Date().toISOString().split('T')[0],
    truck_no: '', transport_name: '',
    quantity_bales: 0, rate: 0, net_weight: 0,
    cotton_value: 0, gst_percent: 5, gst_amount: 0, total_bill_amount: 0,
    remarks: ''
  });

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.passing) delete (payload as any).passing; 

      await axios.post('http://127.0.0.1:8000/api/deliveries/', payload);
      alert('Delivery Saved!');
      setIsFormOpen(false);
      fetchData();
      setFormData({
        bargain: '', passing: '', bill_no: '', bill_date: new Date().toISOString().split('T')[0],
        truck_no: '', transport_name: '', quantity_bales: 0, rate: 0, net_weight: 0,
        cotton_value: 0, gst_percent: 5, gst_amount: 0, total_bill_amount: 0, remarks: ''
      });
      setSearchTerm("");
    } catch (error) {
      console.error("Error saving:", error);
      alert('Error saving data.');
    }
  };

  const listToFilter = isDirectDelivery ? bargains : passings;
  const filteredList = listToFilter.filter((item: any) => {
    if (isDirectDelivery) {
      return item.smart_deal_id?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return item.passing_no?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

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
                      <ul className="neu-dropdown">
                        {filteredList.map((item: any) => (
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

            <div className="md:col-span-4 flex justify-end gap-4 mt-2 pt-4" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={() => setIsFormOpen(false)} className="neu-btn">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-primary" style={{ color: "var(--cb-secondary)", borderColor: "rgba(90, 143, 74, 0.3)" }}>
                <Save size={18} /> Save Delivery
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table */}
      <div className="neu-card overflow-hidden p-2 sm:p-4">
        <div className="p-3 mb-2">
          <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Recent Deliveries</h3>
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading...</td></tr>
              ) : deliveries.map((del) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}