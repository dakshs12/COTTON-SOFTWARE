"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, CheckCircle, X, ChevronDown, FileCheck } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto neu-fade-in">
      
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
                      onBlur={() => setTimeout(() => setIsDealDropdownOpen(false), 200)}
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
                            <div>
                              <span className="font-bold" style={{ color: "var(--cb-primary)" }}>{b.smart_deal_id}</span>
                              <span className="text-xs block" style={{ color: "var(--cb-text-label)" }}>
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
               <label className="neu-label">Passing No</label>
               <input name="passing_no" value={formData.passing_no} onChange={handleChange} className="neu-input" required />
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
               <label className="neu-label">Lot No</label>
               <input name="lot_no" value={formData.lot_no} onChange={handleChange} className="neu-input" required />
            </div>

            <div className="md:col-span-2">
               <label className="neu-label">Approved By</label>
               <input name="approved_by" value={formData.approved_by} onChange={handleChange} className="neu-input" required />
            </div>
            <div className="md:col-span-2">
               <label className="neu-label">Remarks</label>
               <input name="remarks" value={formData.remarks} onChange={handleChange} className="neu-input" />
            </div>

            {/* Footer */}
            <div className="md:col-span-4 flex justify-end gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--cb-divider)" }}>
              <button type="button" onClick={() => setIsFormOpen(false)} className="neu-btn">
                Cancel
              </button>
              <button type="submit" className="neu-btn neu-btn-primary" style={{ color: "var(--cb-secondary)", borderColor: "rgba(90, 143, 74, 0.3)" }}>
                <Save size={18} /> Save Passing
              </button>
            </div>

          </form>
        </div>
      )}

      {/* List Table */}
      <div className="neu-card overflow-hidden p-2 sm:p-4">
        <div className="p-3 mb-2">
           <h3 className="font-bold" style={{ color: "var(--cb-text-heading)" }}>Recent Approvals</h3>
        </div>
        <div className="overflow-x-auto" style={{ borderRadius: "12px" }}>
          <table className="neu-table">
            <thead>
              <tr>
                <th>Passing No</th>
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
              ) : passings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--cb-text-label)" }}>No passing entries found.</td></tr>
              ) : passings.map((pass) => (
                <tr key={pass.id}>
                  <td className="font-medium" style={{ color: "var(--cb-text-heading)" }}>{pass.passing_no}</td>
                  <td>{formatDate(pass.approval_date)}</td>
                  <td className="font-mono font-bold" style={{ color: "var(--cb-primary)" }}>{pass.deal_no}</td>
                  <td>{pass.seller_name}</td>
                  <td>{pass.buyer_name}</td>
                  <td className="font-mono">{pass.lot_no}</td>
                  <td className="text-right">
                     <span style={{ color: "var(--cb-secondary)" }} className="flex justify-end">
                       <FileCheck size={18}/>
                     </span>
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