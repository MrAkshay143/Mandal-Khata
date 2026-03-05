import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Check, Calendar, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Customer {
  id: number;
  name: string;
  mobile?: string;
}

export function EntryModal({ isOpen, onClose }: EntryModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [type, setType] = useState<'GAVE' | 'GOT'>('GAVE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const { triggerRefresh, language } = useApp();
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      fetch('/api/customers')
        .then(res => res.json())
        .then(data => setCustomers(data))
        .catch(err => console.error(err));
    } else {
      // Reset when closed
      setEditingTransactionId(null);
      setAmount('');
      setDescription('');
      setSelectedCustomerId(null);
    }
  }, [isOpen]);

  // Listen for custom event to open modal from other components
  useEffect(() => {
    const handleOpenEntry = (e: CustomEvent) => {
      const { customerId, type: initialType, transaction } = e.detail;
      
      if (transaction) {
        setEditingTransactionId(transaction.id);
        setSelectedCustomerId(customerId);
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDescription(transaction.description || '');
        const tDate = new Date(transaction.date);
        setDate(format(tDate, 'yyyy-MM-dd'));
        setTime(format(tDate, 'HH:mm'));
      } else {
        setEditingTransactionId(null);
        setSelectedCustomerId(customerId);
        if (initialType) setType(initialType);
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setTime(format(new Date(), 'HH:mm'));
      }
    };

    window.addEventListener('open-add-entry' as any, handleOpenEntry);
    return () => window.removeEventListener('open-add-entry' as any, handleOpenEntry);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!selectedCustomerId) { setFormError('Please select a customer'); return; }
    if (!amount || parseFloat(amount) <= 0) { setFormError('Please enter a valid amount'); return; }

    try {
      const url = editingTransactionId ? `/api/transactions/${editingTransactionId}` : '/api/transactions';
      const method = editingTransactionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          type,
          amount: parseFloat(amount),
          description,
          date: `${date}T${time}:00`
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      // Reset and close
      setAmount('');
      setDescription('');
      setEditingTransactionId(null);
      onClose();
      
      // Refresh data via context
      triggerRefresh();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save transaction. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-end justify-center backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300 max-h-[88vh] flex flex-col"
      >
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <h2 className="font-bold text-sm text-gray-800 dark:text-zinc-100">{editingTransactionId ? t.editEntry : t.addEntry}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Inline Error Banner */}
        {formError && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-3 py-2 text-xs font-semibold">
            <span className="shrink-0">⚠️</span>
            <span>{formError}</span>
            <button onClick={() => setFormError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-3 h-3" /></button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-zinc-400 block">{t.customerName}</label>
            {!selectedCustomerId ? (
              <select 
                className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                value={selectedCustomerId || ''}
              >
                <option value="">{t.selectCustomer}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                <span className="font-bold text-emerald-900 dark:text-emerald-400 text-sm">
                  {customers.find(c => c.id === selectedCustomerId)?.name || 'Selected Customer'}
                </span>
                {!editingTransactionId && (
                  <button 
                    type="button"
                    onClick={() => setSelectedCustomerId(null)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-500 hover:underline"
                  >
                    {t.change}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Transaction Type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('GAVE')}
              className={cn(
                "py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                type === 'GAVE'
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-500"
              )}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span className="font-bold text-xs">{t.debit}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('GOT')}
              className={cn(
                "py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                type === 'GOT'
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-500"
              )}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span className="font-bold text-xs">{t.credit}</span>
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-zinc-400 block mb-1">{t.amount}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
              <input
                type="number"
                placeholder="0"
                className="w-full pl-8 pr-3 py-2.5 text-xl font-bold border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-zinc-400 block mb-1">{t.note}</label>
            <input
              type="text"
              placeholder={t.itemDescription}
              className="w-full p-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 block mb-1">{t.date}</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="date"
                  className="w-full pl-8 pr-1.5 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 block mb-1">{t.time}</label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  type="time"
                  className="w-full pl-8 pr-1.5 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Check className="w-5 h-5" />
            {t.saveEntry}
          </button>
        </form>
      </div>
    </div>
  );
}
