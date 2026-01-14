"use client";
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Save, Plus, FileText, X, Search, ChevronDown, Check } from 'lucide-react';
// Import the new Calendar from your existing folder
import CustomDatePicker from '@/app/components/CustomDatePicker';

export default function BargainEntryPage() {
  const [bargains, setBargains] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search States
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);

  // Smart Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // --- Fixed Option Lists ---
  const PAYMENT_BY_OPTIONS = ["Dispatch Date", "Mill Arrival Date", "Passing Date", "Settlement Date"];
  const DELIVERY_TYPE_OPTIONS = ["Spot", "MD-FOR", "MD", "Ex-Gin", "FOR", "Other"];
  const DEAL_TYPE_OPTIONS = ["Pakka Sauda", "Sub. to Passing", "Mill Condition/Direct Dispatch", "Spot", "Forward"];
  const STATUS_OPTIONS = ["Pending Passing", "Approved", "Rejected", "Cancelled"];
  const UNIT_OPTIONS = ["Candy", "Bales", "Tons", "KGs"];
  const CERTIFICATE_OPTIONS = ["Better Cotton (BCI)", "Organic", "Conventional", "REEL"];
  
  // State Options
  const DEFAULT_STATES = [
    "AP", "Chhattisgarh", "Delhi", "Gujarat", "Haryana", "Himachal", 
    "Karnataka", "MH", "MP", "Madhya Pradesh", "Odisha", "Punjab", 
    "Rajasthan", "TN", "Telangana", "UP"
  ];

  // --- Learning Lists ---
  const DEFAULT_CASH_DISC = ["15% pa", "18% pa", "NA", "Net Cash"];
  const DEFAULT_QC = ["Length 29mm", "Length 28.5mm", "Rd 75", "Trash 3%"];
  const DEFAULT_BARGAIN_TYPE = ["Regular", "High Seas", "Mcx"];

  const getLearnedOptions = (fieldName: string, defaults: string[]) => {
    const used = bargains.map((b: any) => b[fieldName]).filter(Boolean);
    return Array.from(new Set([...defaults, ...used])).sort();
  };

  const cashDiscOptions = useMemo(() => getLearnedOptions('cash_disc', DEFAULT_CASH_DISC), [bargains]);
  const qcOptions = useMemo(() => getLearnedOptions('qc_seller', DEFAULT_QC), [bargains]);
  const bargainTypeOptions = useMemo(() => getLearnedOptions('bargain_type', DEFAULT_BARGAIN_TYPE), [bargains]);
  const certificateOptions = useMemo(() => getLearnedOptions('cotton_certificate', CERTIFICATE_OPTIONS), [bargains]);
  
  const stateOptions = useMemo(() => {
    const usedStates = parties.map(p => p.state).filter(Boolean);
    return Array.from(new Set([...DEFAULT_STATES, ...usedStates])).sort();
  }, [parties]);

  const [formData, setFormData] = useState({
    bargain_date: new Date().toISOString().split('T')[0],
    seller: '', buyer: '', state: '', station: '',
    bales: '', rate: '', unit: 'Candy',
    payment_condition: '', payment_by: 'Dispatch Date',
    cash_disc: '', 
    delivery_terms: '', delivery_type: 'Spot', delivery_from: '',
    deal_type: 'Pakka Sauda', cotton_certificate: '',
    weight_terms: 'Mill Weight',
    advised_by: '', status: 'Pending Passing',
    qc_seller: '', qc_buyer: '',
    bargain_type: '', bargain_no_manual: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bargainRes, partyRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/bargains/'),
        axios.get('http://127.0.0.1:8000/api/parties/')
      ]);
      setBargains(bargainRes.data);
      setParties(partyRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper for the Custom Calendar
  const handleDateChange = (val: string) => {
    setFormData({ ...formData, bargain_date: val });
  };

  const handleAutoSelect = (name: string, val: string) => {
    setFormData({ ...formData, [name]: val });
    setActiveDropdown(null);
  };

  const handlePartySelect = (type: 'seller' | 'buyer', partyId: string, partyName: string, partyStation: string, partyState: string) => {
    if (type === 'seller') {
      setFormData(prev => ({ ...prev, seller: partyId, station: partyStation, state: partyState })); 
      setSellerSearch(partyName);
      setIsSellerDropdownOpen(false);
    } else {
      setFormData(prev => ({ ...prev, buyer: partyId }));
      setBuyerSearch(partyName);
      setIsBuyerDropdownOpen(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/bargains/', formData);
      alert('Deal Saved Successfully!');
      setIsFormOpen(false);
      fetchData();
      setFormData({ ...formData, bales: '', rate: '', remarks: '', bargain_no_manual: '' }); 
    } catch (error) {
      console.error("Error saving deal:", error);
      alert('Error saving deal.');
    }
  };

  // --- REUSABLE SMART DROPDOWN ---
  const renderSmartDropdown = (label: string, name: string, options: string[], placeholder: string = "Select...") => {
    const filtered = options.filter(opt => opt.toLowerCase().includes((formData as any)[name]?.toLowerCase() || ''));
    
    return (
      <div className="relative group">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{label}</label>
        <div className="relative">
           <input 
             name={name}
             value={(formData as any)[name]}
             onChange={handleChange}
             onFocus={() => setActiveDropdown(name)}
             onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
             className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm text-slate-700 bg-white cursor-pointer"
             placeholder={placeholder}
             autoComplete="off"
           />
           <ChevronDown size={16} className={`absolute right-3 top-3.5 text-gray-400 pointer-events-none transition-transform duration-200 ${activeDropdown === name ? 'rotate-180' : ''}`}/>
           
           {activeDropdown === name && (
             <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
               {filtered.map(opt => (
                 <li key={opt} onMouseDown={() => handleAutoSelect(name, opt)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center group">
                   {opt}
                   {(formData as any)[name] === opt && <Check size={14} className="text-blue-600"/>}
                 </li>
               ))}
               {filtered.length === 0 && <li className="px-4 py-2 text-xs text-gray-400 italic">Type to add new...</li>}
             </ul>
           )}
        </div>
      </div>
    );
  };

  const filteredSellers = parties.filter(p => p.company_name.toLowerCase().includes(sellerSearch.toLowerCase()));
  const filteredBuyers = parties.filter(p => p.company_name.toLowerCase().includes(buyerSearch.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">Bargain Entry</h1><p className="text-sm text-slate-500">Log new deals.</p></div>
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"><Plus size={18} /> New Deal</button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mb-8 relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
          <h2 className="text-lg font-bold mb-6 text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Deal Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5">
                
                {/* Row 1 */}
                <div className="col-span-1">
                   {/* NEW CALENDAR COMPONENT */}
                   <CustomDatePicker 
                      label="Bargain Date" 
                      value={formData.bargain_date} 
                      onChange={handleDateChange} 
                   />
                </div>
                
                <div className="col-span-1 relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Seller</label>
                    <input type="text" value={sellerSearch} onChange={(e) => { setSellerSearch(e.target.value); setIsSellerDropdownOpen(true); }} onFocus={() => setIsSellerDropdownOpen(true)} onBlur={() => setTimeout(() => setIsSellerDropdownOpen(false), 200)} placeholder="Search..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm cursor-pointer" required />
                    {isSellerDropdownOpen && <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">{filteredSellers.map(p => <li key={p.id} onMouseDown={() => handlePartySelect('seller', p.id, p.company_name, p.station, p.state)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">{p.company_name}</li>)}</ul>}
                </div>
                
                <div className="col-span-1 relative">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Buyer</label>
                    <input type="text" value={buyerSearch} onChange={(e) => { setBuyerSearch(e.target.value); setIsBuyerDropdownOpen(true); }} onFocus={() => setIsBuyerDropdownOpen(true)} onBlur={() => setTimeout(() => setIsBuyerDropdownOpen(false), 200)} placeholder="Search..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm cursor-pointer" required />
                    {isBuyerDropdownOpen && <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">{filteredBuyers.map(p => <li key={p.id} onMouseDown={() => handlePartySelect('buyer', p.id, p.company_name, '', '')} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm">{p.company_name}</li>)}</ul>}
                </div>
                
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Station</label>
                   <input name="station" value={formData.station} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm" />
                </div>

                {/* Row 2 */}
                <div className="col-span-1">
                   {renderSmartDropdown("State", "state", stateOptions)}
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Bales</label>
                   <input type="number" name="bales" value={formData.bales} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-mono" required />
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Rate</label>
                   <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm font-mono" required />
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Payment (Days)</label>
                   <input type="number" name="payment_condition" value={formData.payment_condition} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm" />
                </div>

                {/* Row 3 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Payment By", "payment_by", PAYMENT_BY_OPTIONS)}
                </div>
                <div className="col-span-1">
                  {renderSmartDropdown("Cash Disc", "cash_disc", cashDiscOptions)}
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Delivery Terms</label>
                   <input name="delivery_terms" value={formData.delivery_terms} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm" />
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Delivery Type", "delivery_type", DELIVERY_TYPE_OPTIONS)}
                </div>

                {/* Row 4 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Deal Type", "deal_type", DEAL_TYPE_OPTIONS)}
                </div>
                <div className="col-span-1">
                   {renderSmartDropdown("Cotton Certificate", "cotton_certificate", certificateOptions)}
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Delivery From</label>
                   <input name="delivery_from" value={formData.delivery_from} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm" />
                </div>
                 <div className="col-span-1">
                   {renderSmartDropdown("Status", "status", STATUS_OPTIONS)}
                </div>

                 {/* Row 5 */}
                <div className="col-span-1">
                   {renderSmartDropdown("Unit", "unit", UNIT_OPTIONS)}
                </div>
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Advised By</label>
                   <input name="advised_by" value={formData.advised_by} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm" />
                </div>
                
                {/* Weight Terms */}
                <div className="col-span-2 flex items-center gap-8 pt-6 pl-2">
                   <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mr-2">Weight Terms:</label>
                   <label className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition border ${formData.weight_terms === 'Mill Weight' ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-gray-50'}`}>
                      <input type="radio" name="weight_terms" value="Mill Weight" checked={formData.weight_terms === 'Mill Weight'} onChange={handleChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500 scale-125 cursor-pointer"/>
                      <span className="text-sm font-medium">Mill Weight</span>
                   </label>
                   <label className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition border ${formData.weight_terms === 'Spot Weight' ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-gray-50'}`}>
                      <input type="radio" name="weight_terms" value="Spot Weight" checked={formData.weight_terms === 'Spot Weight'} onChange={handleChange} className="w-5 h-5 text-blue-600 focus:ring-blue-500 scale-125 cursor-pointer"/>
                      <span className="text-sm font-medium">Spot Weight</span>
                   </label>
                </div>
            </div>

            {/* --- BOTTOM SECTION --- */}
            <div className="border-t border-gray-100 pt-6 mt-2">
               <h3 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2">Quality Condition & Remarks</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderSmartDropdown("QC Seller", "qc_seller", qcOptions)}
                  {renderSmartDropdown("QC Buyer", "qc_buyer", qcOptions)}
                  
                  {renderSmartDropdown("Bargain Type", "bargain_type", bargainTypeOptions)}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Bargain No. (Manual)</label>
                    <input name="bargain_no_manual" value={formData.bargain_no_manual} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm" />
                  </div>
               </div>
               <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Remarks</label>
                  <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition text-sm h-16 resize-none" />
               </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition transform active:scale-95">
                <Save size={18} /> Save Deal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table - Kept Clean */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Recent Deals</h3>
             <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
               <tr>
                <th className="px-6 py-3">Deal No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Bales</th>
                <th className="px-6 py-3">Rate</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (<tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>) : bargains.map((deal) => (
                <tr key={deal.deal_no} className="hover:bg-blue-50/50 transition duration-150">
                  <td className="px-6 py-3 font-mono text-blue-600 font-bold">{deal.smart_deal_id}</td>
                  <td className="px-6 py-3 text-slate-600">{deal.bargain_date}</td>
                  <td className="px-6 py-3 font-medium text-slate-700">{deal.seller_name}</td>
                  <td className="px-6 py-3 font-medium text-slate-700">{deal.buyer_name}</td>
                  <td className="px-6 py-3 font-mono">{deal.bales}</td>
                  <td className="px-6 py-3 font-mono">{deal.rate}</td>
                  <td className="px-6 py-3 text-right"><span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">{deal.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}