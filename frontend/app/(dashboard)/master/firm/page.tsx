"use client";
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Save, Building2, Plus, Edit2, X, ChevronDown, Check, CheckCircle, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { useDropdownKeyboardNav } from '@/app/hooks/useDropdownKeyboardNav';

export default function FirmMasterPage() {
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{id: number, displayId: string} | null>(null);
  
  // State Dropdown Logic
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

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
    firm_name: '', title: '', firm_no: '', tagline: '', jurisdiction: '',
    address: '', branch_address: '', city: '', pincode: '', state: '',
    tele_o: '', mobile: '', email: '', website: '', contact_person: '', contact_person_designation: '',
    cin_no: '', pan_no: '', gst_no: '', tan_no: '',
    bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
  });
  const [letterheadFile, setLetterheadFile] = useState<File | null>(null);
  const [existingLetterhead, setExistingLetterhead] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  // Smart Filter Logic
  const filteredStates = useMemo(() => {
    if (!formData.state) return availableStates;
    const isExactMatch = availableStates.some(st => st.toLowerCase() === formData.state.toLowerCase());
    if (isExactMatch) return availableStates;
    return availableStates.filter(st => st.toLowerCase().includes(formData.state.toLowerCase()));
  }, [formData.state, availableStates]);

  const { highlightedIndex: stateHighlightedIndex, handleKeyDown: handleStateKeyDown, listRef: stateListRef } = useDropdownKeyboardNav(
    filteredStates,
    isStateDropdownOpen,
    setIsStateDropdownOpen,
    (val: string) => handleStateSelect(val)
  );

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await api.get('firms/');
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
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, (formData as any)[key]);
      });
      if (letterheadFile) {
        data.append('letterhead', letterheadFile);
      }

      if (editId) {
        await api.put(`firms/${editId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToastMessage({text: 'Firm Updated Successfully!', type: 'success'});
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        await api.post('firms/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToastMessage({text: 'Firm Saved Successfully!', type: 'success'});
        setTimeout(() => setToastMessage(null), 3000);
      }
      setIsFormOpen(false);
      setEditId(null);
      fetchFirms();
      // Reset
      setFormData({
        firm_name: '', title: '', firm_no: '', tagline: '', jurisdiction: '',
        address: '', branch_address: '', city: '', pincode: '', state: '',
        tele_o: '', mobile: '', email: '', website: '', contact_person: '', contact_person_designation: '',
        cin_no: '', pan_no: '', gst_no: '', tan_no: '',
        bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
      });
      setLetterheadFile(null);
      setExistingLetterhead(null);
    } catch (error) {
      console.error("Error saving firm:", error);
      setToastMessage({text: 'Error saving data.', type: 'error'});
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleEdit = (firm: any) => {
    setFormData({
      firm_name: firm.firm_name || '', title: firm.title || '', firm_no: firm.firm_no || '', tagline: firm.tagline || '', jurisdiction: firm.jurisdiction || '',
      address: firm.address || '', branch_address: firm.branch_address || '', city: firm.city || '', pincode: firm.pincode || '', state: firm.state || '',
      tele_o: firm.tele_o || '', mobile: firm.mobile || '', email: firm.email || '', website: firm.website || '', contact_person: firm.contact_person || '', contact_person_designation: firm.contact_person_designation || '',
      cin_no: firm.cin_no || '', pan_no: firm.pan_no || '', gst_no: firm.gst_no || '', tan_no: firm.tan_no || '',
      bank_name: firm.bank_name || '', branch: firm.branch || '', bank_ac_no: firm.bank_ac_no || '', ifsc_code: firm.ifsc_code || ''
    });
    setExistingLetterhead(firm.letterhead || null);
    setLetterheadFile(null);
    setEditId(firm.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerDelete = (id: number, displayId: string) => {
    setRecordToDelete({ id, displayId });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await api.delete(`firms/${recordToDelete.id}/`);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      fetchFirms();
    } catch (error) {
      console.error("Error deleting firm:", error);
    }
  };


  return (
    <div className="max-w-7xl mx-auto neu-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Firm Master</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Manage your own company details for billing.
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="neu-btn neu-btn-action"
        >
          <Plus size={18} />
          Add Firm
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="neu-card p-8 mb-8 relative">
          <button 
            onClick={() => {
              setIsFormOpen(false);
              setEditId(null);
              setFormData({
                firm_name: '', title: '', firm_no: '', tagline: '', jurisdiction: '',
                address: '', branch_address: '', city: '', pincode: '', state: '',
                tele_o: '', mobile: '', email: '', website: '', contact_person: '', contact_person_designation: '',
                cin_no: '', pan_no: '', gst_no: '', tan_no: '',
                bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
              });
            }}
            className="neu-btn neu-btn-cancel-action absolute top-5 right-5 p-2 rounded-full cursor-pointer"
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
            <Building2 size={20} style={{ color: "var(--cb-primary)" }}/> {editId ? 'Edit Firm Details' : 'New Firm Details'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Section 1: Basic Info --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-6 gap-6">
               <div className="col-span-1">
                <label className="neu-label">Title</label>
                <input name="title" placeholder="M/s" value={formData.title} onChange={handleChange} className="neu-input" />
              </div>
              <div className="col-span-3">
                <label className="neu-label">Firm Name</label>
                <input name="firm_name" value={formData.firm_name} onChange={handleChange} className="neu-input" required />
              </div>
              <div className="col-span-2">
                 <label className="neu-label">UPLOAD FIRM LOGO</label>
                 <div className="flex gap-3">
                   <div className="neu-input w-32 flex items-center bg-gray-50 text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap" title={letterheadFile ? letterheadFile.name : (existingLetterhead ? existingLetterhead.split('/').pop() : 'No file selected')}>
                     {letterheadFile ? letterheadFile.name : (existingLetterhead ? existingLetterhead.split('/').pop() : 'No file selected')}
                   </div>
                   <button 
                     type="button" 
                     className="neu-btn neu-btn-action flex items-center justify-center px-4"
                     onClick={() => document.getElementById('letterhead_input')?.click()}
                   >
                     <Upload size={18} />
                   </button>
                   <input 
                     id="letterhead_input"
                     type="file" 
                     accept="image/*"
                     onChange={(e) => {
                       const file = e.target.files ? e.target.files[0] : null;
                       if (file && file.size > 2 * 1024 * 1024) {
                         setToastMessage({ text: "Firm logo file size exceeds 2 MB limit.", type: "error" });
                         e.target.value = '';
                         setLetterheadFile(null);
                         return;
                       }
                       setLetterheadFile(file);
                     }} 
                     className="hidden" 
                   />
                 </div>
              </div>
              
              <div className="col-span-6 mt-2">
                <label className="neu-label">Tagline (e.g. Cotton Broker & Commission Agent)</label>
                <input name="tagline" placeholder="Optional sub-title printed below firm name on bills" value={formData.tagline} onChange={handleChange} className="neu-input" />
              </div>
            </div>

            {/* --- Section 2: Address --- */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="neu-label">Registered Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="neu-input" style={{ height: "42px", resize: "none", overflow: "hidden" }} required />
              </div>
              <div className="col-span-1">
                <label className="neu-label">Branch Office Address</label>
                <textarea name="branch_address" value={formData.branch_address} onChange={handleChange} className="neu-input" style={{ height: "42px", resize: "none", overflow: "hidden" }} />
              </div>
            </div>
            
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <div className="col-span-1">
                 <label className="neu-label">City</label>
                 <input name="city" value={formData.city} onChange={handleChange} className="neu-input" required />
              </div>
              
              {/* SMART STATE DROPDOWN */}
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
                    size={16}
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
                          {formData.state === st && <Check size={14} style={{ color: "var(--cb-primary)" }} />}
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

              <div className="col-span-1">
                 <label className="neu-label">Pin Code</label>
                 <input name="pincode" value={formData.pincode} onChange={handleChange} className="neu-input" />
              </div>
              <div className="col-span-1">
                 <label className="neu-label">Jurisdiction</label>
                 <input name="jurisdiction" placeholder="Indore" value={formData.jurisdiction} onChange={handleChange} className="neu-input" />
              </div>
            </div>

            {/* --- Section 3: Contact & Web --- */}
            <div className="md:col-span-4 pt-5 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <h3 className="neu-section-title mb-4">Contact & Web</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="neu-label">Contact Person</label>
                  <input name="contact_person" placeholder="Contact Person" value={formData.contact_person} onChange={handleChange} className="neu-input" />
                </div>
                <div>
                  <label className="neu-label">Designation</label>
                  <input name="contact_person_designation" placeholder="Designation" value={formData.contact_person_designation} onChange={handleChange} className="neu-input" />
                </div>
                <div>
                  <label className="neu-label">Mobile</label>
                  <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="neu-input" required />
                </div>
                <div>
                  <label className="neu-label">Office Tele</label>
                  <input name="tele_o" placeholder="Office Tele" value={formData.tele_o} onChange={handleChange} className="neu-input" />
                </div>
                <div>
                  <label className="neu-label">Email</label>
                  <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="neu-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                 <div className="col-span-2">
                   <label className="neu-label">Website URL</label>
                   <input name="website" placeholder="Website URL" value={formData.website} onChange={handleChange} className="neu-input" />
                 </div>
              </div>
            </div>

            {/* --- Section 4: Registration & Banking --- */}
            <div className="md:col-span-4 pt-5 mt-2" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <h3 className="neu-section-title mb-4">Registration & Banking</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="neu-label">GST No</label>
                  <input name="gst_no" placeholder="GST No" value={formData.gst_no} onChange={handleChange} className="neu-input" />
                </div>
                <div>
                  <label className="neu-label">PAN No</label>
                  <input name="pan_no" placeholder="PAN No" value={formData.pan_no} onChange={handleChange} className="neu-input" />
                </div>
                <div>
                  <label className="neu-label">CIN No</label>
                  <input name="cin_no" placeholder="CIN No" value={formData.cin_no} onChange={handleChange} className="neu-input" />
                </div>
                <div>
                  <label className="neu-label">TAN No</label>
                  <input name="tan_no" placeholder="TAN No" value={formData.tan_no} onChange={handleChange} className="neu-input" />
                </div>
                
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
            <div className="md:col-span-4 flex justify-end gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={() => {
                setIsFormOpen(false);
                setEditId(null);
                setFormData({
                  firm_name: '', title: '', firm_no: '', tagline: '', jurisdiction: '',
                  address: '', branch_address: '', city: '', pincode: '', state: '',
                  tele_o: '', mobile: '', email: '', website: '', contact_person: '', contact_person_designation: '',
                  cin_no: '', pan_no: '', gst_no: '', tan_no: '',
                  bank_name: '', branch: '', bank_ac_no: '', ifsc_code: ''
                });
              }} className="neu-btn neu-btn-cancel-action">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-action">
                <Save size={18} /> {editId ? 'Update Firm' : 'Save Firm'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- Data List Table --- */}
      <div className="neu-card overflow-hidden p-2 sm:p-4">
        <div className="overflow-x-auto" style={{ borderRadius: "12px" }}>
          <table className="neu-table">
            <thead>
              <tr>
                <th>Firm Name</th>
                <th>City</th>
                <th>GST No</th>
                <th>Contact</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading firms...</td></tr>
              ) : firms.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>No firms found. Add your company!</td></tr>
              ) : firms.map((firm) => (
                <tr key={firm.id}>
                  <td className="font-semibold" style={{ color: "var(--cb-text-heading)" }}>
                    <div className="flex items-center gap-2">
                      <Building2 size={16} style={{ color: "var(--cb-primary)" }}/>
                      {firm.firm_name}
                    </div>
                  </td>
                  <td>{firm.city}</td>
                  <td>
                    <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: "#dde3eb", color: "var(--cb-text-label)" }}>
                      {firm.gst_no || 'N/A'}
                    </span>
                  </td>
                  <td>{firm.mobile}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                      <button onClick={() => handleEdit(firm)} className="neu-btn neu-btn-action p-2" style={{ padding: "0.35rem" }}>
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => triggerDelete(firm.id, firm.firm_name)}
                        className="neu-btn neu-btn-danger-action p-2 ml-1" style={{ padding: "0.35rem" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="neu-card px-6 py-4 flex items-center gap-3" style={{ borderRadius: "12px", borderLeft: `4px solid ${toastMessage.type === 'success' ? '#10b981' : '#ef4444'}` }}>
            {toastMessage.type === 'success' ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
            <span className="font-semibold text-gray-700">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center neu-fade-in p-4">
          <div className="bg-[var(--cb-bg)] p-8 rounded-[30px] shadow-neu max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
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