"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Save, Search, Plus, Edit2, X, Trash2, ChevronDown, Check } from 'lucide-react';
import { useDropdownKeyboardNav } from '@/app/hooks/useDropdownKeyboardNav';

export default function PartyMasterPage() {
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  const PARTY_TYPES = ["Mill", "Trader", "Ginner", "Buyer", "Seller"];

  // 2. Smart State Logic: Combine Default + Database States
  const availableStates = useMemo(() => {
    const usedStates = parties.map(p => p.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [parties]);

  const [formData, setFormData] = useState({
    party_code: '', company_name: '', station: '', 
    address: '', state: '', pincode: '', party_type: 'Mill',
    contact_person: '', contact_person_designation: '', mobile: '', whatsapp_no: '', 
    email1: '', email2: '', pan_no: '', gst_no: '', ho_unit: '',
    bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get('parties/');
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
      if (editId) {
        await api.put(`parties/${editId}/`, formData);
        showToast('Party Updated Successfully!', 'success');
      } else {
        await api.post('parties/', formData);
        showToast('Party Saved Successfully!', 'success');
      }
      setIsFormOpen(false);
      setEditId(null);
      fetchParties();
      setFormData({
        party_code: '', company_name: '', station: '', 
        address: '', state: '', pincode: '', party_type: 'Mill',
        contact_person: '', contact_person_designation: '', mobile: '', whatsapp_no: '', 
        email1: '', email2: '', pan_no: '', gst_no: '', ho_unit: '',
        bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
      });
    } catch (error) {
      console.error("Error saving party:", error);
      showToast('Error saving data.', 'error');
    }
  };

  const handleEdit = (party: any) => {
    setFormData({
        party_code: party.party_code || '', company_name: party.company_name || '', station: party.station || '', 
        address: party.address || '', state: party.state || '', pincode: party.pincode || '', party_type: party.party_type || 'Mill',
        contact_person: party.contact_person || '', contact_person_designation: party.contact_person_designation || '', mobile: party.mobile || '', whatsapp_no: party.whatsapp_no || '', 
        email1: party.email1 || '', email2: party.email2 || '', pan_no: party.pan_no || '', gst_no: party.gst_no || '', ho_unit: party.ho_unit || '',
        bank_name: party.bank_name || '', branch: party.branch || '', bank_ac_no: party.bank_ac_no || '', ifsc_code: party.ifsc_code || ''
    });
    setEditId(party.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // --- Filter & Pagination Logic ---
  const filteredParties = parties.filter(party => 
    party.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.party_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.station.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
  const currentParties = filteredParties.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const { highlightedIndex: stateHighlightedIndex, handleKeyDown: handleStateKeyDown, listRef: stateListRef } = useDropdownKeyboardNav(
    filteredStates,
    isStateDropdownOpen,
    setIsStateDropdownOpen,
    handleStateSelect
  );

  const { highlightedIndex: typeHighlightedIndex, handleKeyDown: handleTypeKeyDown, listRef: typeListRef } = useDropdownKeyboardNav(
    PARTY_TYPES,
    isTypeDropdownOpen,
    setIsTypeDropdownOpen,
    handleTypeSelect
  );

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
              className="neu-btn neu-btn-action"
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
              className="neu-btn neu-btn-cancel-action absolute top-6 right-6 p-2 rounded-full cursor-pointer"
              style={{ padding: "0.5rem" }}
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
              {editId ? 'Edit Party Details' : 'New Party Entry'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* --- Section 1: Basic Info --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label className="neu-label">Party Code</label>
                  <input name="party_code" value={formData.party_code} onChange={handleChange} className="neu-input" required />
                </div>
                <div className="col-span-3">
                  <label className="neu-label">Company Name</label>
                  <input name="company_name" value={formData.company_name} onChange={handleChange} className="neu-input" required />
                </div>
              </div>

              {/* --- Section 2: Address & Dropdowns --- */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="col-span-2">
                  <label className="neu-label">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="neu-input" style={{ height: "42px", resize: "none", overflow: "hidden" }} />
                </div>
                
                <div className="col-span-1">
                   <label className="neu-label">Station / City</label>
                   <input name="station" value={formData.station} onChange={handleChange} className="neu-input" required />
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
                      onKeyDown={handleStateKeyDown}
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
                      <ul className="neu-dropdown" ref={stateListRef}>
                        {filteredStates.map((st, idx) => (
                          <li 
                            key={st} 
                            onMouseDown={() => handleStateSelect(st)}
                            style={stateHighlightedIndex === idx ? { backgroundColor: '#dde3eb' } : {}}
                          >
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

                {/* CUSTOM PINCODE FIELD INSTEAD OF PARTY TYPE */}
                <div className="col-span-1">
                  <label className="neu-label">Pin Code</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} className="neu-input" />
                </div>
              </div>

              {/* --- Section 3: Contact Details --- */}
              <div className="pt-5 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
                <h3 className="neu-section-title mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* MOVED PARTY TYPE DROPDOWN */}
                  <div className="col-span-1 relative">
                    <label className="neu-label">Party Type</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={formData.party_type} 
                        readOnly
                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        onBlur={() => setTimeout(() => setIsTypeDropdownOpen(false), 200)}
                        onKeyDown={handleTypeKeyDown}
                        className="neu-input cursor-pointer pr-10"
                      />
                      <ChevronDown
                        className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                        size={18}
                        style={{ color: "var(--cb-text-label)" }}
                      />
                      
                      {isTypeDropdownOpen && (
                        <ul className="neu-dropdown" ref={typeListRef}>
                          {PARTY_TYPES.map((type, idx) => (
                            <li 
                              key={type} 
                              onMouseDown={() => handleTypeSelect(type)}
                              style={typeHighlightedIndex === idx ? { backgroundColor: '#dde3eb' } : {}}
                            >
                              {type}
                              {formData.party_type === type && <Check size={16} style={{ color: "var(--cb-primary)" }} strokeWidth={3} />}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <label className="neu-label">Contact Person</label>
                    <input name="contact_person" value={formData.contact_person} onChange={handleChange} className="neu-input" />
                  </div>
                  <div className="col-span-1">
                    <label className="neu-label">Designation</label>
                    <input name="contact_person_designation" value={formData.contact_person_designation} onChange={handleChange} className="neu-input" />
                  </div>
                  <div className="col-span-1">
                    <label className="neu-label">Mobile</label>
                    <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="neu-input" required />
                  </div>
                  <div className="col-span-1">
                    <label className="neu-label">WhatsApp No</label>
                    <input name="whatsapp_no" placeholder="WhatsApp No" value={formData.whatsapp_no} onChange={handleChange} className="neu-input" />
                  </div>
                  <div className="col-span-1">
                    <label className="neu-label">HO / Unit</label>
                    <input name="ho_unit" placeholder="HO / Unit" value={formData.ho_unit} onChange={handleChange} className="neu-input" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <div>
                     <label className="neu-label">Email #1</label>
                     <input name="email1" placeholder="Email #1" value={formData.email1} onChange={handleChange} className="neu-input" />
                   </div>
                   <div>
                     <label className="neu-label">Email #2</label>
                     <input name="email2" placeholder="Email #2" value={formData.email2} onChange={handleChange} className="neu-input" />
                   </div>
                </div>
              </div>

              {/* --- Section 4: Bank & Tax --- */}
              <div style={{ borderTop: "1px solid var(--cb-divider)", paddingTop: "1.5rem" }}>
                <h3 className="neu-section-title mb-5">Banking & Tax</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="neu-label">GST No</label>
                    <input name="gst_no" placeholder="GST No" value={formData.gst_no} onChange={handleChange} className="neu-input" />
                  </div>
                  <div>
                    <label className="neu-label">PAN No</label>
                    <input name="pan_no" placeholder="PAN No" value={formData.pan_no} onChange={handleChange} className="neu-input" />
                  </div>
                  <div className="col-span-2 hidden md:block"></div> {/* Spacer */}
                  
                  <div>
                    <label className="neu-label">Bank Name</label>
                    <input name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleChange} className="neu-input" />
                  </div>
                  <div>
                    <label className="neu-label">Branch</label>
                    <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} className="neu-input" />
                  </div>
                  <div>
                    <label className="neu-label">Account No</label>
                    <input name="bank_ac_no" placeholder="Account No" value={formData.bank_ac_no} onChange={handleChange} className="neu-input" />
                  </div>
                  <div>
                    <label className="neu-label">IFSC Code</label>
                    <input name="ifsc_code" placeholder="IFSC Code" value={formData.ifsc_code} onChange={handleChange} className="neu-input" />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-5 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditId(null);
                    setFormData({
                      party_code: '', company_name: '', station: '', 
                      address: '', state: '', pincode: '', party_type: 'Mill',
                      contact_person: '', contact_person_designation: '', mobile: '', whatsapp_no: '', 
                      email1: '', email2: '', pan_no: '', gst_no: '', ho_unit: '',
                      bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
                    });
                  }}
                  className="neu-btn neu-btn-cancel-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neu-btn neu-btn-action"
                >
                  <Save size={18} strokeWidth={2.5} /> {editId ? 'Update Party' : 'Save Party'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* --- Data List Table Container --- */}
      {/* Table */}
      <div className="neu-card p-2 sm:p-4 mt-8">
        <div className="p-3 flex justify-between items-center mb-2">
             <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>All Parties</h3>
             <div className="relative">
               <Search className="absolute right-3 top-2.5" size={16} style={{ color: "var(--cb-text-label)" }} />
               <input 
                 type="text" 
                 placeholder="Search name, code, city..." 
                 className="neu-input pl-4 pr-9 py-2" 
                 style={{ width: "260px" }}
                 value={searchTerm}
                 onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setCurrentPage(1); // Reset to page 1 on new search
                 }}
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
                <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading...</td></tr>
              ) : currentParties.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10" style={{ color: "var(--cb-text-label)" }}>No parties found in the system.</td></tr>
              ) : currentParties.map((party) => (
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
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                        <button onClick={() => handleEdit(party)} className="neu-btn neu-btn-action p-2" style={{ padding: "0.4rem" }}>
                          <Edit2 size={16} strokeWidth={2.5}/>
                        </button>
                        <button className="neu-btn neu-btn-danger-action p-2" style={{ padding: "0.4rem" }}>
                          <Trash2 size={16} strokeWidth={2.5}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {!loading && totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-gray-100">
            <span className="text-sm font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredParties.length)} of {filteredParties.length} entries
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
    </div>
  );
}