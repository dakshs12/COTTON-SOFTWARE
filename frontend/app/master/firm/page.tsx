"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Save, Building2, Plus, Edit2, X, Trash2, ChevronDown, Check, Globe, Phone, Mail } from 'lucide-react';

export default function FirmMasterPage() {
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State Dropdown Logic
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);

  const DEFAULT_STATES = [
    "AP", "Chhattisgarh", "Delhi", "Gujarat", "Haryana", "Himachal", 
    "Karnataka", "MH", "MP", "Madhya Pradesh", "Odisha", "Punjab", 
    "Rajasthan", "TN", "Telangana", "UP"
  ];

  // Smart State List (Defaults + Existing in DB)
  const availableStates = useMemo(() => {
    const usedStates = firms.map(f => f.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [firms]);

  const [formData, setFormData] = useState({
    firm_name: '', title: '', firm_no: '',
    address: '', city: '', pincode: '', state: '',
    tele_o: '', mobile: '', email: '', website: '', contact_person: '',
    cin_no: '', pan_no: '', gst_no: '', tan_no: '',
    bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
  });

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/firms/');
      setFirms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStateSelect = (val: string) => {
    setFormData({ ...formData, state: val });
    setIsStateDropdownOpen(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/firms/', formData);
      alert('Firm Saved Successfully!');
      setIsFormOpen(false);
      fetchFirms();
      // Reset
      setFormData({
        firm_name: '', title: '', firm_no: '',
        address: '', city: '', pincode: '', state: '',
        tele_o: '', mobile: '', email: '', website: '', contact_person: '',
        cin_no: '', pan_no: '', gst_no: '', tan_no: '',
        bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
      });
    } catch (error) {
      console.error("Error saving firm:", error);
      alert('Error saving data.');
    }
  };

  // Smart Filter Logic
  const filteredStates = useMemo(() => {
    if (!formData.state) return availableStates;
    const isExactMatch = availableStates.some(st => st.toLowerCase() === formData.state.toLowerCase());
    if (isExactMatch) return availableStates;
    return availableStates.filter(st => st.toLowerCase().includes(formData.state.toLowerCase()));
  }, [formData.state, availableStates]);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Firm Master</h1>
          <p className="text-sm text-slate-500">Manage your own company details for billing.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Firm
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mb-8 relative">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded-full"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-lg font-bold mb-6 text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600"/> New Firm Details
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Section 1: Basic Info --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-6 gap-6">
               <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Title</label>
                <input name="title" placeholder="M/s" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Firm Name</label>
                <input name="firm_name" value={formData.firm_name} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
              </div>
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Firm No</label>
                 <input name="firm_no" value={formData.firm_no} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
              </div>
            </div>

            {/* --- Section 2: Address --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition h-[42px] resize-none overflow-hidden" required />
              </div>
              <div className="col-span-1">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">City</label>
                 <input name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
              </div>
              
              {/* SMART STATE DROPDOWN */}
              <div className="col-span-1 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">State</label>
                <div className="relative">
                  <input 
                    type="text"
                    name="state" 
                    value={formData.state} 
                    onChange={(e) => { handleChange(e); setIsStateDropdownOpen(true); }}
                    onFocus={() => setIsStateDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsStateDropdownOpen(false), 200)}
                    placeholder="Select or Type..."
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer" 
                    autoComplete="off"
                    required 
                  />
                  <ChevronDown className={`absolute right-3 top-3.5 text-gray-400 pointer-events-none transition-transform duration-200 ${isStateDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                  
                  {isStateDropdownOpen && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {filteredStates.map((st) => (
                        <li key={st} onMouseDown={() => handleStateSelect(st)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center group">
                          {st}
                          {formData.state === st && <Check size={14} className="text-blue-600" />}
                        </li>
                      ))}
                      {filteredStates.length === 0 && <li className="px-4 py-2 text-xs text-gray-400 italic">Type to add new...</li>}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* --- Section 3: Contact & Web --- */}
            <div className="md:col-span-4 border-t border-gray-100 pt-5 mt-2">
              <h3 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2">Contact & Web</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input name="contact_person" placeholder="Contact Person" value={formData.contact_person} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" required />
                <input name="tele_o" placeholder="Office Tele" value={formData.tele_o} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                 <input name="website" placeholder="Website URL" value={formData.website} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                 <input name="pincode" placeholder="Pin Code" value={formData.pincode} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
              </div>
            </div>

            {/* --- Section 4: Registration & Banking --- */}
            <div className="md:col-span-4 border-t border-gray-100 pt-5 mt-2">
              <h3 className="text-sm font-bold text-blue-600 mb-4">Registration & Banking</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input name="gst_no" placeholder="GST No" value={formData.gst_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="pan_no" placeholder="PAN No" value={formData.pan_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="cin_no" placeholder="CIN No" value={formData.cin_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="tan_no" placeholder="TAN No" value={formData.tan_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                
                <input name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="bank_ac_no" placeholder="Account No" value={formData.bank_ac_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
                <input name="ifsc_code" placeholder="IFSC Code" value={formData.ifsc_code} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition" />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="md:col-span-4 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition transform active:scale-95">
                <Save size={18} /> Save Firm
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- Data List Table --- */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Firm Name</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">GST No</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading firms...</td></tr>
              ) : firms.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No firms found. Add your company!</td></tr>
              ) : firms.map((firm) => (
                <tr key={firm.id} className="hover:bg-blue-50/50 transition duration-150 group">
                  <td className="px-6 py-3 font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500"/>
                      {firm.firm_name}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{firm.city}</td>
                  <td className="px-6 py-3 font-mono text-slate-500 text-xs bg-gray-100 px-2 py-1 rounded w-fit">{firm.gst_no || 'N/A'}</td>
                  <td className="px-6 py-3 text-slate-600">{firm.mobile}</td>
                  <td className="px-6 py-3 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition"><Edit2 size={16} /></button>
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