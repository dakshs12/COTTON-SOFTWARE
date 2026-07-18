"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { IndianRupee, Search, ChevronRight, CheckCircle2, History } from 'lucide-react';
import PaymentModal from './PaymentModal';

export default function DueListPage() {
  const [partyDues, setPartyDues] = useState<any[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [partyBills, setPartyBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchPartyDues();
  }, []);

  const fetchPartyDues = async () => {
    try {
      const response = await api.get('brokerage/party-dues/');
      setPartyDues(response.data);
      setLoading(false);
      
      // Auto select first party if not selected
      if (response.data.length > 0 && !selectedPartyId) {
        handleSelectParty(response.data[0].party_id);
      }
    } catch (error) {
      console.error("Error fetching party dues:", error);
      setLoading(false);
    }
  };

  const handleSelectParty = async (partyId: number) => {
    setSelectedPartyId(partyId);
    try {
      const response = await api.get(`brokerage/party-dues/${partyId}/`);
      setPartyBills(response.data);
    } catch (error) {
      console.error("Error fetching party bills:", error);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    fetchPartyDues();
    if (selectedPartyId) {
      handleSelectParty(selectedPartyId);
    }
  };

  const filteredParties = partyDues.filter(p => 
    p.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedParty = partyDues.find(p => p.party_id === selectedPartyId);

  return (
    <div className="max-w-7xl mx-auto neu-fade-in flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="neu-page-title text-3xl">Due List & Payments</h1>
          <p className="mt-1 font-medium" style={{ color: "var(--cb-text-label)" }}>
            Track outstanding brokerage bills and record lump-sum party payments.
          </p>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Side: Party List */}
        <div className="w-1/3 neu-card flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Party..." 
                className="neu-input w-full pr-10 pl-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <p className="text-center mt-4 text-gray-500">Loading...</p>
            ) : filteredParties.length === 0 ? (
              <p className="text-center mt-4 text-gray-500">No dues found.</p>
            ) : (
              <div className="space-y-2">
                {filteredParties.map(party => (
                  <div 
                    key={party.party_id}
                    onClick={() => handleSelectParty(party.party_id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedPartyId === party.party_id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-transparent hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800">{party.company_name}</h3>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-500 font-semibold flex items-center">
                        <IndianRupee size={12} className="mr-0.5"/> {party.balance_due.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium">
                        {party.bill_count} Bills
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bill Details */}
        <div className="w-2/3 flex flex-col min-h-0">
          {selectedPartyId ? (
            <div className="neu-card flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedParty?.company_name}</h2>
                  <p className="text-sm font-medium text-red-500 flex items-center mt-1">
                    Total Due: <IndianRupee size={12} className="ml-1 mr-0.5"/> {selectedParty?.balance_due.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </p>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="neu-btn neu-btn-action flex items-center"
                >
                  <IndianRupee size={18} className="mr-1" />
                  Receive Payment
                </button>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="neu-table w-full relative">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr>
                      <th>Bill No</th>
                      <th>Date</th>
                      <th className="text-right">Net Amount</th>
                      <th className="text-right">Paid</th>
                      <th className="text-right text-red-600 font-bold">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partyBills.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">
                          No unpaid bills for this party.
                        </td>
                      </tr>
                    ) : partyBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="font-medium text-gray-800">{bill.bill_no}</td>
                        <td className="text-gray-600">{bill.bill_date}</td>
                        <td className="text-right font-medium">
                          ₹ {parseFloat(bill.net_amount).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right text-green-600 font-medium">
                          ₹ {parseFloat(bill.amount_paid).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right font-bold text-red-500">
                          ₹ {parseFloat(bill.balance_due).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="neu-card flex-1 flex flex-col items-center justify-center text-gray-400">
              <History size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a party to view their due list</p>
            </div>
          )}
        </div>

      </div>

      {isPaymentModalOpen && selectedParty && (
        <PaymentModal 
          party={selectedParty}
          bills={partyBills}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
