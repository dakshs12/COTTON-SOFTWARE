"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Truck, X, Search, ChevronDown } from 'lucide-react';
// Import the Custom Calendar
import CustomDatePicker from '@/app/components/CustomDatePicker';

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
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Delivery Details</h1>
          <p className="text-sm text-slate-500">Generate bills and track logistics.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium">
          <Plus size={18} /> New Delivery
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mb-8 relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
          
          <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Truck size={20} className="text-blue-600"/> Delivery Entry</h2>
            
            {/* Direct Delivery Toggle */}
            <label className="flex items-center gap-2 text-sm cursor-pointer bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition">
              <input type="checkbox" checked={isDirectDelivery} onChange={() => { setIsDirectDelivery(!isDirectDelivery); setSearchTerm(""); }} className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <span className="font-semibold text-slate-600">Direct Delivery (Skip Passing)</span>
            </label>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Search Section --- */}
            <div className="md:col-span-4 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1 relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wide">
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
                      className="w-full border border-blue-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white cursor-pointer"
                    />
                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-blue-400 pointer-events-none"/>
                    {isDropdownOpen && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                        {filteredList.map((item: any) => (
                          <li key={item.id || item.deal_no} onMouseDown={() => handleSelection(item)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                            {isDirectDelivery ? (
                                <span><span className="font-bold text-blue-700">{item.smart_deal_id}</span> - {item.seller_name}</span>
                            ) : (
                                <span><span className="font-bold text-green-700">{item.passing_no}</span> (Deal: {item.deal_no})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
               </div>
               <div className="col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wide">Seller</label><div className="font-semibold text-slate-700">{displayInfo.seller || "-"}</div></div>
               <div className="col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wide">Buyer</label><div className="font-semibold text-slate-700">{displayInfo.buyer || "-"}</div></div>
            </div>

            {/* --- Logistics --- */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Bill / Invoice No</label>
               <input name="bill_no" value={formData.bill_no} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition" required />
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
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Truck No</label>
               <input name="truck_no" value={formData.truck_no} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition" required />
            </div>
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Transport Name</label>
               <input name="transport_name" value={formData.transport_name} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition" />
            </div>

            {/* --- Calculation --- */}
            <div className="md:col-span-4 border-t pt-4 grid grid-cols-1 md:grid-cols-5 gap-4 bg-green-50/50 p-4 rounded-lg">
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1.5 tracking-wide">Bales</label>
                    <input type="number" name="quantity_bales" value={formData.quantity_bales} onChange={handleChange} className="w-full border border-green-200 p-2 rounded outline-none font-mono" />
                </div>
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1.5 tracking-wide">Rate</label>
                    <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="w-full border border-green-200 p-2 rounded outline-none font-mono" />
                </div>
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1.5 tracking-wide">Cotton Value</label>
                    <input value={formData.cotton_value} readOnly className="w-full bg-green-100 border border-green-200 p-2 rounded outline-none font-mono font-bold" />
                </div>
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1.5 tracking-wide">GST (5%)</label>
                    <input value={formData.gst_amount} readOnly className="w-full bg-green-100 border border-green-200 p-2 rounded outline-none font-mono" />
                </div>
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-green-700 uppercase mb-1.5 tracking-wide">Total Bill</label>
                    <input value={formData.total_bill_amount} readOnly className="w-full bg-green-200 border border-green-300 p-2 rounded outline-none font-mono text-lg font-bold text-green-900" />
                </div>
            </div>

            <div className="md:col-span-4 flex justify-end gap-4 mt-2 border-t pt-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
              <button type="submit" className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition transform active:scale-95">
                <Save size={18} /> Save Delivery
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-bold text-slate-700">Recent Deliveries</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Bill No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Deal / Passing</th>
                <th className="px-6 py-3">Truck No</th>
                <th className="px-6 py-3">Bales</th>
                <th className="px-6 py-3 text-right">Bill Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : deliveries.map((del) => (
                <tr key={del.id} className="hover:bg-blue-50/50 transition duration-150">
                  <td className="px-6 py-3 font-bold text-slate-700">{del.bill_no}</td>
                  <td className="px-6 py-3 text-slate-600">{del.bill_date}</td>
                  <td className="px-6 py-3 text-xs">
                    <div className="font-bold text-blue-600">{del.deal_display}</div>
                    {del.passing_ref ? <div className="text-green-600">Ref: {del.passing_ref}</div> : <div className="text-orange-500 italic">Direct</div>}
                  </td>
                  <td className="px-6 py-3 font-mono">{del.truck_no}</td>
                  <td className="px-6 py-3 font-mono">{del.quantity_bales}</td>
                  <td className="px-6 py-3 text-right font-bold text-green-700">₹{del.total_bill_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}