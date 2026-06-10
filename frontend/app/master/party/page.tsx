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
      setLoading(false);
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

  const filteredStates = useMemo(() => {
    if (!formData.state) return availableStates;
    const isExactMatch = availableStates.some(st => 
      st.toLowerCase() === formData.state.toLowerCase()
    );
    if (isExactMatch) return availableStates;
    return availableStates.filter(st => 
      st.toLowerCase().includes(formData.state.toLowerCase())
    );
  }, [formData.state, availableStates]);

  return (
    <div className="max-w-7xl mx-auto neu-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="neu-page-title text-3xl">Party Master</h1>
            <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>Manage buyers, sellers, and brokers.</p>
          </div>
          {!isFormOpen && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="neu-btn neu-btn-primary"
            >
              <Plus size={20} strokeWidth={2.5} />
              Add Party
            </button>
          )}
        </div>

        {/* Form Container */}
        {isFormOpen && (
          <div className="neu-card p-8 mb-12 relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full transition-colors duration-150 cursor-pointer"
              style={{ color: "var(--cb-text-label)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--cb-danger)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--cb-text-label)"; }}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <h2
              className="text-xl font-bold mb-8 pb-4"
              style={{
                color: "var(--cb-text-heading)",
                borderBottom: "2px solid var(--cb-divider)",
                fontFamily: "var(--font-playfair-display), 'Playfair Display', serif",
              }}
            >
              New Party Entry
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* --- Section 1: Basic Info --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label className="neu-label">Party Code</label>
                  <input name="party_code" value={formData.party_code} onChange={handleChange} className="neu-input" required />
                </div>
                <div className="col-span-2">
                  <label className="neu-label">Company Name</label>
                  <input name="company_name" value={formData.company_name} onChange={handleChange} className="neu-input" required />
                </div>
                <div className="col-span-1">
                   <label className="neu-label">Station / City</label>
                   <input name="station" value={formData.station} onChange={handleChange} className="neu-input" required />
                </div>
              </div>

              {/* --- Section 2: Address & Dropdowns --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-2">
                  <label className="neu-label">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="neu-input" style={{ height: "48px", resize: "none", overflow: "hidden" }} />
                </div>
                
                {/* CUSTOM STATE DROPDOWN */}
                <div className="col-span-1 relative">
                  <label className="neu-label">State</label>
                  <div className="relative">
                    <input 
                      type="text"
                      name="state" 
                      value={formData.state} 
                      onChange={(e) => { handleChange(e); setIsStateDropdownOpen(true); }}
                      onFocus={() => setIsStateDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsStateDropdownOpen(false), 200)}
                      placeholder="Select or Type..."
                      className="neu-input cursor-pointer pr-10"
                      autoComplete="off"
                      required 
                    />
                    <ChevronDown
                      className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isStateDropdownOpen ? 'rotate-180' : ''}`}
                      size={18}
                      style={{ color: "var(--cb-text-label)" }}
                    />
                    
                    {isStateDropdownOpen && (
                      <ul className="neu-dropdown">
                        {filteredStates.map((st) => (
                          <li key={st} onMouseDown={() => handleStateSelect(st)}>
                            {st}
                            {formData.state === st && <Check size={16} style={{ color: "var(--cb-primary)" }} strokeWidth={3} />}
                          </li>
                        ))}
                        {filteredStates.length === 0 && (
                          <li className="italic" style={{ color: "var(--cb-text-placeholder)", fontSize: "0.75rem", cursor: "default" }}>
                            Type to add new...
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* CUSTOM PARTY TYPE DROPDOWN */}
                <div className="col-span-1 relative">
                  <label className="neu-label">Party Type</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={formData.party_type} 
                      readOnly
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsTypeDropdownOpen(false), 200)}
                      className="neu-input cursor-pointer pr-10"
                    />
                    <ChevronDown
                      className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                      size={18}
                      style={{ color: "var(--cb-text-label)" }}
                    />
                    
                    {isTypeDropdownOpen && (
                      <ul className="neu-dropdown">
                        {PARTY_TYPES.map((type) => (
                          <li key={type} onMouseDown={() => handleTypeSelect(type)}>
                            {type}
                            {formData.party_type === type && <Check size={16} style={{ color: "var(--cb-primary)" }} strokeWidth={3} />}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* --- Section 3: Contact Details --- */}
              <div style={{ borderTop: "1px solid var(--cb-divider)", paddingTop: "1.5rem" }}>
                <h3 className="neu-section-title mb-5">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <input name="contact_person" placeholder="Contact Person" value={formData.contact_person} onChange={handleChange} className="neu-input" />
                  <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="neu-input" required />
                  <input name="whatsapp_no" placeholder="WhatsApp No" value={formData.whatsapp_no} onChange={handleChange} className="neu-input" />
                  <input name="ho_unit" placeholder="HO / Unit" value={formData.ho_unit} onChange={handleChange} className="neu-input" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <input name="email1" placeholder="Email #1" value={formData.email1} onChange={handleChange} className="neu-input" />
                   <input name="email2" placeholder="Email #2" value={formData.email2} onChange={handleChange} className="neu-input" />
                </div>
              </div>

              {/* --- Section 4: Bank & Tax --- */}
              <div style={{ borderTop: "1px solid var(--cb-divider)", paddingTop: "1.5rem" }}>
                <h3 className="neu-section-title mb-5">Banking & Tax</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <input name="gst_no" placeholder="GST No" value={formData.gst_no} onChange={handleChange} className="neu-input" />
                  <input name="pan_no" placeholder="PAN No" value={formData.pan_no} onChange={handleChange} className="neu-input" />
                  <div className="col-span-2 hidden md:block"></div> {/* Spacer */}
                  
                  <input name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleChange} className="neu-input" />
                  <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} className="neu-input" />
                  <input name="bank_ac_no" placeholder="Account No" value={formData.bank_ac_no} onChange={handleChange} className="neu-input" />
                  <input name="ifsc_code" placeholder="IFSC Code" value={formData.ifsc_code} onChange={handleChange} className="neu-input" />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-5 pt-8">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="neu-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-btn neu-btn-primary"
                >
                  <Save size={18} strokeWidth={2.5} /> Save Party
                </button>
              </div>

            </form>
          </div>
        )}

        {/* --- Data List Table Container --- */}
        <div className="neu-card p-4 sm:p-5 overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-3 mb-3 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-4 top-3" size={18} style={{ color: "var(--cb-text-label)" }} />
              <input 
                type="text" 
                placeholder="Search by Name, Code or City..." 
                className="neu-input pr-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto" style={{ borderRadius: "12px" }}>
            <table className="neu-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Company</th>
                  <th>Station</th>
                  <th>Type</th>
                  <th>Mobile</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10" style={{ color: "var(--cb-text-label)" }}>Loading records...</td></tr>
                ) : parties.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10" style={{ color: "var(--cb-text-label)" }}>No parties found in the system.</td></tr>
                ) : parties.map((party) => (
                  <tr key={party.id}>
                    <td className="font-mono font-bold" style={{ color: "var(--cb-primary)" }}>{party.party_code}</td>
                    <td className="font-bold" style={{ color: "var(--cb-text-heading)" }}>{party.company_name}</td>
                    <td className="font-medium">{party.station}</td>
                    <td>
                      <span
                        className="neu-chip"
                        style={{
                          color: party.party_type === 'Mill' ? 'var(--cb-tertiary)' :
                                 party.party_type === 'Ginner' ? 'var(--cb-secondary)' :
                                 'var(--cb-primary)'
                        }}
                      >
                        {party.party_type}
                      </span>
                    </td>
                    <td className="font-mono font-medium" style={{ color: "var(--cb-text-label)" }}>{party.mobile}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="neu-btn p-2" style={{ color: "var(--cb-primary)", padding: "0.4rem" }}>
                          <Edit2 size={16} strokeWidth={2.5}/>
                        </button>
                        <button className="neu-btn p-2" style={{ color: "var(--cb-danger)", padding: "0.4rem" }}>
                          <Trash2 size={16} strokeWidth={2.5}/>
                        </button>
                      </div>
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