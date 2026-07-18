"use client";
import { Toast } from '@/app/components/Toast';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { X, IndianRupee, ChevronDown, Check } from 'lucide-react';

export default function PaymentModal({ party, bills, onClose, onSuccess }: any) {
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToastMessage({text: msg, type});
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const PAYMENT_MODES = ["NEFT", "Cheque", "UPI", "Cash"];
  const MODE_DISPLAY: Record<string, string> = {
    "NEFT": "NEFT / RTGS",
    "Cheque": "Cheque",
    "UPI": "UPI",
    "Cash": "Cash"
  };
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [allocations, setAllocations] = useState<{bill_id: number, allocated_amount: string}[]>([]);

  // Initialize allocations
  useEffect(() => {
    setAllocations(bills.map((b: any) => ({ bill_id: b.id, allocated_amount: '' })));
  }, [bills]);

  const handleAmountChange = (e: any) => {
    const val = e.target.value;
    setAmount(val);
  };

  const handleAutoAllocate = () => {
    let remaining = parseFloat(amount) || 0;
    const newAllocations = bills.map((b: any) => {
      const balance = parseFloat(b.balance_due) || 0;
      let allocated = 0;
      if (remaining >= balance) {
        allocated = balance;
        remaining -= balance;
      } else if (remaining > 0) {
        allocated = remaining;
        remaining = 0;
      }
      return { bill_id: b.id, allocated_amount: allocated > 0 ? allocated.toString() : '' };
    });
    setAllocations(newAllocations);
  };

  const handleAllocationChange = (billId: number, value: string) => {
    setAllocations(allocations.map(a => 
      a.bill_id === billId ? { ...a, allocated_amount: value } : a
    ));
  };

  const totalAllocated = allocations.reduce((sum, a) => sum + (parseFloat(a.allocated_amount) || 0), 0);
  const totalAmount = parseFloat(amount) || 0;
  const isOverAllocated = totalAllocated > totalAmount;
  const isUnderAllocated = totalAllocated < totalAmount;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount.", 'error');
      return;
    }
    if (isOverAllocated) {
      showToast("Allocated amount exceeds receipt amount!", 'error');
      return;
    }
    
    try {
      const payload = {
        party_id: party.party_id,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        receipt_date: receiptDate,
        reference_no: referenceNo,
        remarks: remarks,
        allocations: allocations.filter(a => parseFloat(a.allocated_amount) > 0)
      };
      
      await api.post('brokerage/receive-payment/', payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      showToast("Error processing payment.", 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center neu-fade-in p-4">
      <div className="bg-[var(--cb-bg)] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
        
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Receive Payment</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">{party.company_name}</p>
          </div>
          <button onClick={onClose} className="neu-btn neu-btn-cancel-action p-2 rounded-full" style={{ padding: "0.5rem" }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Payment Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="neu-label">Receipt Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  className="neu-input font-bold text-lg text-green-600 w-full"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="md:col-span-2">
                <label className="neu-label">Date</label>
                <input 
                  type="date" 
                  required 
                  className="neu-input w-full"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2 relative">
                <label className="neu-label">Mode</label>
                <div className="relative">
                  <input
                    type="text"
                    value={MODE_DISPLAY[paymentMode] || paymentMode}
                    readOnly
                    onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsModeDropdownOpen(false), 200)}
                    className="neu-input w-full cursor-pointer pr-10"
                  />
                  <ChevronDown
                    className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`}
                    size={18}
                    style={{ color: "var(--cb-text-label)" }}
                  />
                  {isModeDropdownOpen && (
                    <ul className="neu-dropdown z-50">
                      {PAYMENT_MODES.map((mode) => (
                        <li
                          key={mode}
                          onMouseDown={() => setPaymentMode(mode)}
                        >
                          {MODE_DISPLAY[mode]}
                          {paymentMode === mode && <Check size={16} style={{ color: "var(--cb-primary)" }} strokeWidth={3} />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="neu-label">Reference No</label>
                <input 
                  type="text" 
                  className="neu-input w-full"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="Txn ID or Cheque No"
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Allocations */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Bill Allocation</h3>
                  <p className="text-sm text-gray-500 mt-1">Distribute the receipt amount across pending bills.</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleAutoAllocate}
                  className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Auto-Allocate Chronologically
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-3 font-semibold">Bill No</th>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold text-right">Balance Due</th>
                      <th className="p-3 font-semibold text-right">Allocation (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bills.map((bill: any) => {
                      const alloc = allocations.find(a => a.bill_id === bill.id);
                      return (
                        <tr key={bill.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-medium text-gray-800">{bill.bill_no}</td>
                          <td className="p-3 text-gray-500">{bill.bill_date}</td>
                          <td className="p-3 text-right font-medium text-red-500">
                            {parseFloat(bill.balance_due).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </td>
                          <td className="p-3 w-48">
                            <input 
                              type="number" 
                              className="neu-input py-1.5 px-3 text-right text-green-600 font-bold w-full"
                              placeholder="0.00"
                              value={alloc?.allocated_amount || ''}
                              onChange={(e) => handleAllocationChange(bill.id, e.target.value)}
                              max={bill.balance_due}
                              step="0.01"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className={`mt-4 p-4 rounded-xl flex justify-between items-center font-bold ${
                isOverAllocated ? 'bg-red-50 text-red-600 border border-red-200' :
                isUnderAllocated ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-green-50 text-green-600 border border-green-200'
              }`}>
                <span>Total Allocated: ₹ {totalAllocated.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                <span>Unallocated: ₹ {Math.max(0, totalAmount - totalAllocated).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>

            </div>

            <div>
              <label className="neu-label">Remarks (Optional)</label>
              <textarea 
                className="neu-input w-full"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="neu-btn neu-btn-cancel-action"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="payment-form"
            className="neu-btn neu-btn-action"
            disabled={isOverAllocated || !amount}
          >
            Save Payment & Allocations
          </button>
        </div>

      </div>
      <Toast message={toastMessage} />
    </div>
  );
}
