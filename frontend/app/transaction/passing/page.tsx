"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, CheckCircle, X, Search, FileCheck, ChevronDown } from 'lucide-react';
// Import the Custom Calendar
import CustomDatePicker from '@/app/components/CustomDatePicker';

export default function PassingEntryPage() {
  const [passings, setPassings] = useState<any[]>([]);
  const [bargains, setBargains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search State for Deal Selection
  const [dealSearch, setDealSearch] = useState("");
  const [isDealDropdownOpen, setIsDealDropdownOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    bargain: '', // This stores the ID
    passing_no: '',
    approval_date: new Date().toISOString().split('T')[0],
    due_date: '',
    lot_no: '',
    approved_by: '',
    remarks: ''
  });

  // Display State
  const [selectedDealDisplay, setSelectedDealDisplay] = useState({
    seller: '',
    buyer: '',
    rate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [passingRes, bargainRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/passings/'),
        axios.get('http://127.0.0.1:8000/api/bargains/')
      ]);
      setPassings(passingRes.data);
      setBargains(bargainRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic: When user selects a Deal
  const handleDealSelect = (deal: any) => {
    setFormData({ ...formData, bargain: deal.deal_no }); // Store ID
    setDealSearch(deal.smart_deal_id); // Show Smart ID
    
    // Auto-fill visual details
    setSelectedDealDisplay({
      seller: deal.seller_name,
      buyer: deal.buyer_name,
      rate: deal.rate
    });
    
    setIsDealDropdownOpen(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/passings/', formData);
      alert('Passing Saved Successfully!');
      setIsFormOpen(false);
      fetchData();
      // Reset
      setFormData({
        bargain: '', passing_no: '', approval_date: new Date().toISOString().split('T')[0],
        due_date: '', lot_no: '', approved_by: '', remarks: ''
      });
      setDealSearch("");
      setSelectedDealDisplay({ seller: '', buyer: '', rate: '' });
    } catch (error) {
      console.error("Error saving passing:", error);
      alert('Error saving data.');
    }
  };

  const filteredBargains = bargains.filter(b => 
    b.smart_deal_id?.toLowerCase().includes(dealSearch.toLowerCase()) || 
    b.seller_name?.toLowerCase().includes(dealSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Passing Entry</h1>
          <p className="text-sm text-slate-500">Record quality approvals.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mb-8 relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
          <h2 className="text-lg font-bold mb-6 text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-600"/> Quality Approval Form
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Section 1: Link to Deal --- */}
            <div className="md:col-span-4 bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-1 relative">
                  <label className="block text-xs font-bold text-blue-700 uppercase mb-1.5">Select Deal</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={dealSearch}
                      onChange={(e) => { setDealSearch(e.target.value); setIsDealDropdownOpen(true); }}
                      onFocus={() => setIsDealDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDealDropdownOpen(false), 200)}
                      placeholder="Search Deal..."
                      className="w-full border border-blue-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white cursor-pointer"
                      required
                    />
                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-blue-400 pointer-events-none"/>
                    {isDealDropdownOpen && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                        {filteredBargains.map(b => (
                          <li key={b.deal_no} onMouseDown={() => handleDealSelect(b)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                            <span className="font-bold text-blue-700">{b.smart_deal_id}</span>
                            <span className="text-xs text-gray-500 block">{b.seller_name} ➔ {b.buyer_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
               </div>

               <div className="col-span-1">
                 <label className="block text-xs font-bold text-blue-400 uppercase mb-1.5">Seller</label>
                 <div className="text-sm font-semibold text-slate-700 mt-2">{selectedDealDisplay.seller || "-"}</div>
               </div>
               <div className="col-span-1">
                 <label className="block text-xs font-bold text-blue-400 uppercase mb-1.5">Buyer</label>
                 <div className="text-sm font-semibold text-slate-700 mt-2">{selectedDealDisplay.buyer || "-"}</div>
               </div>
            </div>

            {/* --- Section 2: Passing Details --- */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Passing No</label>
               <input name="passing_no" value={formData.passing_no} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
            </div>
            
            <div className="col-span-1">
               {/* CUSTOM CALENDAR 1 */}
               <CustomDatePicker 
                  label="Approval Date" 
                  value={formData.approval_date} 
                  onChange={(val) => setFormData({...formData, approval_date: val})} 
               />
            </div>
            
            <div className="col-span-1">
               {/* CUSTOM CALENDAR 2 */}
               <CustomDatePicker 
                  label="Due Date (Optional)" 
                  value={formData.due_date} 
                  onChange={(val) => setFormData({...formData, due_date: val})} 
               />
            </div>

            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Lot No</label>
               <input name="lot_no" value={formData.lot_no} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
            </div>

            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Approved By</label>
               <input name="approved_by" value={formData.approved_by} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Remarks</label>
               <input name="remarks" value={formData.remarks} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
            </div>

            {/* Footer */}
            <div className="md:col-span-4 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
              <button type="submit" className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition transform active:scale-95">
                <Save size={18} /> Save Passing
              </button>
            </div>

          </form>
        </div>
      )}

      {/* List Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-bold text-slate-700">Recent Approvals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Passing No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Deal No</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Lot No</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading data...</td></tr>
              ) : passings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No passing entries found.</td></tr>
              ) : passings.map((pass) => (
                <tr key={pass.id} className="hover:bg-blue-50/50 transition duration-150">
                  <td className="px-6 py-3 font-medium text-slate-700">{pass.passing_no}</td>
                  <td className="px-6 py-3 text-slate-600">{pass.approval_date}</td>
                  <td className="px-6 py-3 font-mono text-blue-600 font-bold">{pass.deal_no}</td>
                  <td className="px-6 py-3 text-slate-600">{pass.seller_name}</td>
                  <td className="px-6 py-3 text-slate-600">{pass.buyer_name}</td>
                  <td className="px-6 py-3 font-mono">{pass.lot_no}</td>
                  <td className="px-6 py-3 text-right">
                     <span className="text-green-600 flex justify-end"><FileCheck size={18}/></span>
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