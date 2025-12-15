"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, FileText, X, Search } from 'lucide-react';

export default function BargainEntryPage() {
  const [bargains, setBargains] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Dropdown States
  const [sellerSearch, setSellerSearch] = useState("");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [isSellerDropdownOpen, setIsSellerDropdownOpen] = useState(false);
  const [isBuyerDropdownOpen, setIsBuyerDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    bargain_date: new Date().toISOString().split('T')[0],
    seller: '', buyer: '', 
    station: '', bales: '', rate: '',
    payment_condition: '', payment_by: 'Buyer', cash_disc: '',
    delivery_terms: 'Ex-Mill', delivery_from: '', weight_terms: '',
    deal_type: 'Regular', cotton_certificate: '', quality_condition: '',
    advised_by: '', remarks: ''
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

  const handlePartySelect = (type: 'seller' | 'buyer', partyId: string, partyName: string) => {
    if (type === 'seller') {
      setFormData({ ...formData, seller: partyId });
      setSellerSearch(partyName);
      setIsSellerDropdownOpen(false);
    } else {
      setFormData({ ...formData, buyer: partyId });
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
      setFormData({ ...formData, bales: '', rate: '', remarks: '' }); 
      setSellerSearch(""); setBuyerSearch("");
    } catch (error) {
      console.error("Error saving deal:", error);
      alert('Error saving deal.');
    }
  };

  const filteredSellers = parties.filter(p => p.company_name.toLowerCase().includes(sellerSearch.toLowerCase()));
  const filteredBuyers = parties.filter(p => p.company_name.toLowerCase().includes(buyerSearch.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bargain Entry</h1>
          <p className="text-sm text-slate-500">Log new deals with smart numbering.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <Plus size={18} />
          New Deal
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 mb-8 relative">
          <button onClick={() => setIsFormOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded-full"><X size={20} /></button>
          <h2 className="text-lg font-bold mb-6 text-slate-800 border-b border-gray-100 pb-3 flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Deal Entry Form</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Key Info */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
               <input type="date" name="bargain_date" value={formData.bargain_date} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
            </div>

            {/* SELLER SMART SEARCH */}
            <div className="col-span-1 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Seller</label>
                <div className="relative">
                  <input type="text" value={sellerSearch} onChange={(e) => { setSellerSearch(e.target.value); setIsSellerDropdownOpen(true); }} onFocus={() => setIsSellerDropdownOpen(true)} onBlur={() => setTimeout(() => setIsSellerDropdownOpen(false), 200)} placeholder="Search Seller..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
                  {isSellerDropdownOpen && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                      {filteredSellers.map(p => (
                        <li key={p.id} onMouseDown={() => handlePartySelect('seller', p.id, p.company_name)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700">{p.company_name} <span className="text-xs text-gray-400 block">{p.station}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
            </div>

            {/* BUYER SMART SEARCH */}
            <div className="col-span-1 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Buyer</label>
                <div className="relative">
                  <input type="text" value={buyerSearch} onChange={(e) => { setBuyerSearch(e.target.value); setIsBuyerDropdownOpen(true); }} onFocus={() => setIsBuyerDropdownOpen(true)} onBlur={() => setTimeout(() => setIsBuyerDropdownOpen(false), 200)} placeholder="Search Buyer..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
                  {isBuyerDropdownOpen && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                      {filteredBuyers.map(p => (
                        <li key={p.id} onMouseDown={() => handlePartySelect('buyer', p.id, p.company_name)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700">{p.company_name} <span className="text-xs text-gray-400 block">{p.station}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
            </div>
            
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Station</label>
               <input name="station" value={formData.station} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
            </div>

            {/* Commercials */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Bales (Qty)</label>
               <input type="number" name="bales" value={formData.bales} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-mono" required />
            </div>
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Rate (Rs/Candy)</label>
               <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none font-mono" required />
            </div>
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Days</label>
               <input type="number" name="payment_condition" placeholder="e.g. 15" value={formData.payment_condition} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" required />
            </div>
             <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment By</label>
               <select name="payment_by" value={formData.payment_by} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white outline-none">
                  <option>Buyer</option>
                  <option>Seller</option>
               </select>
            </div>

            {/* Delivery Terms */}
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Delivery Terms</label>
               <select name="delivery_terms" value={formData.delivery_terms} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg bg-white outline-none">
                  <option>Ex-Mill</option>
                  <option>F.O.R</option>
                  <option>Godown Delivery</option>
               </select>
            </div>
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Delivery From</label>
               <input name="delivery_from" value={formData.delivery_from} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>
             <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Weight Terms</label>
               <input name="weight_terms" value={formData.weight_terms} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>
            <div className="col-span-1">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Cash Discount</label>
               <input name="cash_disc" value={formData.cash_disc} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
            </div>

            {/* Footer Buttons */}
            <div className="md:col-span-4 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition transform active:scale-95">
                <Save size={18} /> Save Deal
              </button>
            </div>

          </form>
        </div>
      )}

      {/* --- Deal Register Table --- */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Recent Deals</h3>
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Search Deal No..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" />
             </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Deal No</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Buyer</th>
                <th className="px-6 py-3">Bales</th>
                <th className="px-6 py-3">Rate</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading deals...</td></tr>
              ) : bargains.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No deals found.</td></tr>
              ) : bargains.map((deal) => (
                <tr key={deal.deal_no} className="hover:bg-blue-50/50 transition duration-150">
                  <td className="px-6 py-3 text-slate-600">{deal.bargain_date}</td>
                  {/* SMART NUMBERING DISPLAY */}
                  <td className="px-6 py-3 font-mono text-blue-600 font-bold tracking-wide">{deal.smart_deal_id}</td>
                  <td className="px-6 py-3 font-medium text-slate-700">{deal.seller_name}</td>
                  <td className="px-6 py-3 font-medium text-slate-700">{deal.buyer_name}</td>
                  <td className="px-6 py-3 font-mono">{deal.bales}</td>
                  <td className="px-6 py-3 font-mono">{deal.rate}</td>
                  <td className="px-6 py-3 text-right">
                     <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">
                       {deal.status}
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