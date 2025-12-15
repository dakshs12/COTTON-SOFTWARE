"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Save, Search, Plus, Edit2, X, Trash2, ChevronDown, Check } from 'lucide-react';

export default function PartyMasterPage() {
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Dropdown States
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // 1. Fixed Lists
  const DEFAULT_STATES = [
    "AP", "Chhattisgarh", "Delhi", "Gujarat", "Haryana", "Himachal", 
    "Karnataka", "MH", "MP", "Madhya Pradesh", "Odisha", "Punjab", 
    "Rajasthan", "TN", "Telangana", "UP"
  ];

  const PARTY_TYPES = ["Mill", "Trader", "Ginner", "Buyer", "Seller", "Other"];

  // 2. Smart State Logic: Combine Default + Database States
  const availableStates = useMemo(() => {
    const usedStates = parties.map(p => p.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [parties]);

  const [formData, setFormData] = useState({
    party_code: '', company_name: '', station: '', 
    address: '', state: '', party_type: 'Mill',
    contact_person: '', mobile: '', whatsapp_no: '', 
    email1: '', email2: '',
    gst_no: '', pan_no: '', ho_unit: '',
    bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/parties/');
      setParties(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper: Select State
  const handleStateSelect = (val: string) => {
    setFormData({ ...formData, state: val });
    setIsStateDropdownOpen(false);
  };

  // Helper: Select Type
  const handleTypeSelect = (val: string) => {
    setFormData({ ...formData, party_type: val });
    setIsTypeDropdownOpen(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/parties/', formData);
      alert('Party Saved Successfully!');
      setIsFormOpen(false);
      fetchParties();
      setFormData({
        party_code: '', company_name: '', station: '', 
        address: '', state: '', party_type: 'Mill',
        contact_person: '', mobile: '', whatsapp_no: '', 
        email1: '', email2: '',
        gst_no: '', pan_no: '', ho_unit: '',
        bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
      });
    } catch (error) {
      console.error("Error saving party:", error);
      alert('Error saving data.');
    }
  };

  // --- THE LOGIC FIX ---
  // If the input matches an existing state EXACTLY (e.g. "Punjab"), show ALL options.
  // Otherwise (e.g. "Pun"), show only filtered options ("Punjab", "Pune").
  const filteredStates = useMemo(() => {
    if (!formData.state) return availableStates;
    
    // Check if current text is an exact match in our list (Case Insensitive)
    const isExactMatch = availableStates.some(st => 
      st.toLowerCase() === formData.state.toLowerCase()
    );

    // If it's an exact match (User selected it), SHOW ALL (so they can switch).
    // If it's NOT an exact match (User is typing new stuff), FILTER it.
    if (isExactMatch) return availableStates;

    return availableStates.filter(st => 
      st.toLowerCase().includes(formData.state.toLowerCase())
    );
  }, [formData.state, availableStates]);


  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Party Master</h1>
          <p className="text-sm text-slate-500">Manage your buyers, sellers, and ginners.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <Plus size={18} />
          Add Party
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
          
          <h2 className="text-lg font-bold mb-6 text-slate-800 border-b border-gray-100 pb-3">
            New Party Entry
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Section 1: Basic Info --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Party Code</label>
                <input name="party_code" value={formData.party_code} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Company Name</label>
                <input name="company_name" value={formData.company_name} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
              </div>
              <div className="col-span-1">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Station / City</label>
                 <input name="station" value={formData.station} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
              </div>
            </div>

            {/* --- Section 2: Address & Dropdowns --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition h-[42px] resize-none overflow-hidden" />
              </div>
              
              {/* CUSTOM STATE DROPDOWN (Smart Filter) */}
              <div className="col-span-1 relative group">
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

              {/* CUSTOM PARTY TYPE DROPDOWN */}
              <div className="col-span-1 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Party Type</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData.party_type} 
                    readOnly
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsTypeDropdownOpen(false), 200)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer bg-white" 
                  />
                  <ChevronDown className={`absolute right-3 top-3.5 text-gray-400 pointer-events-none transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                  
                  {isTypeDropdownOpen && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {PARTY_TYPES.map((type) => (
                        <li key={type} onMouseDown={() => handleTypeSelect(type)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center">
                          {type}
                          {formData.party_type === type && <Check size={14} className="text-blue-600" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* --- Section 3: Contact Details --- */}
            <div className="md:col-span-4 border-t border-gray-100 pt-5 mt-2">
              <h3 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input name="contact_person" placeholder="Contact Person" value={formData.contact_person} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" required />
                <input name="whatsapp_no" placeholder="WhatsApp No" value={formData.whatsapp_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <input name="ho_unit" placeholder="HO / Unit" value={formData.ho_unit} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                 <input name="email1" placeholder="Email #1" value={formData.email1} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                 <input name="email2" placeholder="Email #2" value={formData.email2} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
              </div>
            </div>

            {/* --- Section 4: Bank & Tax --- */}
            <div className="md:col-span-4 border-t border-gray-100 pt-5 mt-2">
              <h3 className="text-sm font-bold text-blue-600 mb-4">Banking & Tax</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input name="gst_no" placeholder="GST No" value={formData.gst_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <input name="pan_no" placeholder="PAN No" value={formData.pan_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <div className="col-span-2 hidden md:block"></div> {/* Spacer */}
                
                <input name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <input name="bank_ac_no" placeholder="Account No" value={formData.bank_ac_no} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
                <input name="ifsc_code" placeholder="IFSC Code" value={formData.ifsc_code} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="md:col-span-4 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition transform active:scale-95">
                <Save size={18} /> Save Party
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- Data List Table --- */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Code or City..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Station</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Mobile</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : parties.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No parties found.</td></tr>
              ) : parties.map((party) => (
                <tr key={party.id} className="hover:bg-blue-50/50 transition duration-150 group">
                  <td className="px-6 py-3 font-mono text-blue-600 font-bold">{party.party_code}</td>
                  <td className="px-6 py-3 font-semibold text-slate-700">{party.company_name}</td>
                  <td className="px-6 py-3 text-slate-600">{party.station}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      party.party_type === 'Mill' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      party.party_type === 'Ginner' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {party.party_type}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-500">{party.mobile}</td>
                  <td className="px-6 py-3 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition"><Edit2 size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition"><Trash2 size={16} /></button>
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