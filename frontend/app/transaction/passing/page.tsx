"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, CheckCircle, X, ChevronDown, FileCheck, Search, Edit2 } from 'lucide-react';
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

const addDaysToDate = (dateStr: string, days: number) => {
  if (!dateStr || !days) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function PassingEntryPage() {
  const [passings, setPassings] = useState<any[]>([]);
  const [bargains, setBargains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [dealSearch, setDealSearch] = useState("");
  const [isDealDropdownOpen, setIsDealDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Form State
  const initialFormState = {
    bargain: '', // This stores the ID
    approval_date: new Date().toISOString().split('T')[0],
    pr_no: '',
    book_bargain_no: '',
    approved_by: '',
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Display State
  const [selectedDealDisplay, setSelectedDealDisplay] = useState({
    seller: '',
    buyer: '',
    rate: '',
    payment_condition: 0
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
      setPassings(passingRes.data.reverse());
      setBargains(bargainRes.data.reverse());
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
    const conditionDays = parseInt(deal.payment_condition) || 0;
    const newDueDate = addDaysToDate(formData.approval_date, conditionDays);

    setFormData({ 
      ...formData, 
      bargain: deal.deal_no,
      due_date: newDueDate 
    }); // Store ID
    setDealSearch(deal.smart_deal_id); // Show Smart ID
    
    // Auto-fill visual details
    setSelectedDealDisplay({
      seller: deal.seller_name,
      buyer: deal.buyer_name,
      rate: deal.rate,
      payment_condition: conditionDays
    });
    
    setIsDealDropdownOpen(false);
  };

  const handleApprovalDateChange = (val: string) => {
    const days = selectedDealDisplay.payment_condition || 0;
    const newDueDate = addDaysToDate(val, days);
    setFormData({ ...formData, approval_date: val, due_date: newDueDate });
  };

  const handleEditClick = (pass: any) => {
    const sanitizedPass = Object.fromEntries(
      Object.entries(pass).map(([k, v]) => [k, v === null ? '' : v])
    );
    
    setFormData({
      ...initialFormState,
      ...sanitizedPass,
      bargain: sanitizedPass.bargain?.toString() || sanitizedPass.deal_no, // Depend on API structure
      approval_date: sanitizedPass.approval_date || initialFormState.approval_date,
    });
    setDealSearch(pass.deal_no || '');
    setSelectedDealDisplay({
      seller: pass.seller_name || '',
      buyer: pass.buyer_name || '',
      rate: pass.rate || '',
      payment_condition: pass.payment_condition || 0
    });
    setEditingId(pass.id);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setDealSearch("");
    setSelectedDealDisplay({ seller: '', buyer: '', rate: '', payment_condition: 0 });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/passings/${editingId}/`, formData);
        showToast('Passing Updated Successfully!');
      } else {
        await axios.post('http://127.0.0.1:8000/api/passings/', formData);
        showToast('Passing Saved Successfully!');
      }
      setIsFormOpen(false);
      setEditingId(null);
      fetchData();
      // Reset
      setFormData(initialFormState);
      setDealSearch("");
      setSelectedDealDisplay({ seller: '', buyer: '', rate: '' });
    } catch (error) {
      console.error("Error saving passing:", error);
      alert('Error saving data.');
    }
  };

  // --- Derived State & Pagination ---
  const filteredBargains = bargains.filter(b => 
    b.smart_deal_id?.toLowerCase().includes(dealSearch.toLowerCase()) ||
    b.buyer_name?.toLowerCase().includes(dealSearch.toLowerCase()) ||
    b.seller_name?.toLowerCase().includes(dealSearch.toLowerCase())
  );

  const filteredPassings = passings.filter(pass => 
    (pass.passing_no && pass.passing_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (pass.deal_no && pass.deal_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (pass.lot_no && pass.lot_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (pass.buyer_name && pass.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (pass.seller_name && pass.seller_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPassings.length / itemsPerPage);
  const currentPassings = filteredPassings.slice(
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
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="neu-page-title text-3xl">Passing Entry</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Record quality approvals.
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="neu-btn neu-btn-primary"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Form */}
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
          <h2
            className="text-lg font-bold mb-6 pb-3 flex items-center gap-2"
            style={{
              color: "var(--cb-text-heading)",
              borderBottom: "2px solid var(--cb-divider)",
              fontFamily: "var(--font-playfair-display), 'Playfair Display', serif",
            }}
          >
            <CheckCircle size={20} style={{ color: "var(--cb-primary)" }}/> Quality Approval Form
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* --- Section 1: Link to Deal --- */}
            <div
              className="md:col-span-4 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 neu-pressed"
            >
               <div className="col-span-1 relative">
                  <label className="neu-label" style={{ color: "var(--cb-primary)" }}>Select Deal</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={dealSearch}
                      onChange={(e) => { setDealSearch(e.target.value); setIsDealDropdownOpen(true); }}
                      onFocus={() => setIsDealDropdownOpen(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsDealDropdownOpen((prev) => (prev ? false : prev));
                        }, 200);
                      }}
                      placeholder="Search Deal..."
                      className="neu-input cursor-pointer pr-10"
                      required
                    />
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-3 pointer-events-none"
                      style={{ color: "var(--cb-primary)" }}
                    />
                    {isDealDropdownOpen && (
                      <ul className="neu-dropdown">
                        {filteredBargains.map(b => (
                          <li key={b.deal_no} onMouseDown={() => handleDealSelect(b)}>
                            <div className="w-full overflow-hidden">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-bold truncate" style={{ color: "var(--cb-primary)" }}>{b.smart_deal_id}</span>
                                <span className="text-xs whitespace-nowrap pl-2" style={{ color: "var(--cb-text-label)" }}>{formatDate(b.bargain_date)}</span>
                              </div>
                              <span className="text-xs block truncate mt-1" style={{ color: "var(--cb-text-label)" }}>
                                {b.seller_name} ➔ {b.buyer_name}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
               </div>

               <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-text-placeholder)" }}>Seller</label>
                 <div className="text-sm font-semibold mt-2" style={{ color: "var(--cb-text-heading)" }}>
                   {selectedDealDisplay.seller || "-"}
                 </div>
               </div>
               <div className="col-span-1">
                 <label className="neu-label" style={{ color: "var(--cb-text-placeholder)" }}>Buyer</label>
                 <div className="text-sm font-semibold mt-2" style={{ color: "var(--cb-text-heading)" }}>
                   {selectedDealDisplay.buyer || "-"}
                 </div>
               </div>
            </div>

            {/* --- Section 2: Passing Details --- */}
            <div className="col-span-1">
               <CustomDatePicker 
                  label="Approval / Dispatch Date" 
                  value={formData.approval_date} 
                  onChange={handleApprovalDateChange} 
               />
            </div>
            
            <div className="col-span-1">
               <CustomDatePicker 
                  label="Due Date (Optional)" 
                  value={formData.due_date} 
                  onChange={(val) => setFormData({...formData, due_date: val})} 
               />
            </div>

            <div className="col-span-1">
               <label className="neu-label">Lot No</label>
               <input name="lot_no" value={formData.lot_no} onChange={handleChange} className="neu-input" required />
            </div>

            <div className="col-span-1">
               <label className="neu-label">PR No</label>
               <input name="pr_no" value={formData.pr_no} onChange={handleChange} className="neu-input" />
            </div>
            
            <div className="md:col-span-1">
               <label className="neu-label">Approved By</label>
               <input name="approved_by" value={formData.approved_by} onChange={handleChange} className="neu-input" required />
            </div>

            <div className="col-span-1">
               <label className="neu-label">BARGAIN NO.</label>
               <input name="book_bargain_no" value={formData.book_bargain_no} onChange={handleChange} className="neu-input" />
            </div>

            <div className="md:col-span-4">
               <label className="neu-label">Remarks</label>
               <input name="remarks" value={formData.remarks} onChange={handleChange} className="neu-input" />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 pt-6 mt-2 md:col-span-4" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={handleCancel} className="neu-btn">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-primary">
                <Save size={18} /> {editingId ? "Update Passing" : "Save Passing"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* List Table */}
      <div className="neu-card p-2 sm:p-4 mt-8">
        <div className="p-3 mb-2 flex justify-between items-center flex-wrap gap-4">
           <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Recent Approvals</h3>
           <div className="relative">
             <Search className="absolute right-3 top-2.5" size={16} style={{ color: "var(--cb-text-label)" }} />
             <input 
               type="text" 
               placeholder="Search passing, deal, lot..." 
               className="neu-input pl-4 pr-9 py-2" 
               style={{ width: "240px" }}
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setCurrentPage(1);
               }}
             />
           </div>
        </div>
        <div className="overflow-x-auto" style={{ borderRadius: "12px" }}>
          <table className="neu-table">
            <thead>
              <tr>
                <th>PR No</th>
                <th>Date</th>
                <th>Deal No</th>
                <th>Seller</th>
                <th>Buyer</th>
                <th>Lot No</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>Loading data...</td></tr>
              ) : currentPassings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>No passing entries found.</td></tr>
              ) : currentPassings.map((pass) => (
                <tr key={pass.id}>
                  <td className="font-bold" style={{ color: "var(--cb-secondary)" }}>{pass.pr_no || "-"}</td>
                  <td>{formatDate(pass.approval_date)}</td>
                  <td className="font-mono font-bold" style={{ color: "var(--cb-primary)" }}>{pass.deal_no}</td>
                  <td>{pass.seller_name}</td>
                  <td>{pass.buyer_name}</td>
                  <td className="font-mono">{pass.lot_no}</td>
                  <td className="text-right">
                    <div className="flex justify-end items-center gap-3">
                      <span style={{ color: "var(--cb-secondary)" }} title="Passed">
                        <FileCheck size={18}/>
                      </span>
                      <button 
                        onClick={() => handleEditClick(pass)}
                        className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-gray-100 text-gray-500 hover:text-[#4a7fc4]"
                        title="Edit Passing"
                      >
                        <Edit2 size={16} />
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
          <div className="p-4 flex justify-between items-center border-t border-gray-100 mt-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPassings.length)} of {filteredPassings.length} entries
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