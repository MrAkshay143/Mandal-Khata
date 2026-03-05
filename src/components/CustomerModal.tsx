import { useState, useEffect, FormEvent } from 'react';
import { X, Check, User, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: {
    id: number;
    name: string;
    mobile?: string;
  } | null;
}

export function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const { triggerRefresh, language } = useApp();
  const t = translations[language];

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setMobile(customer.mobile || '');
    } else {
      setName('');
      setMobile('');
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return alert('Name is required');

    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers';
      const method = customer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile })
      });

      if (!res.ok) throw new Error('Failed to save');

      triggerRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${customer ? 'update' : 'add'} customer`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
          <h2 className="font-bold text-gray-800 dark:text-zinc-100">{customer ? t.editCustomer : t.addNewCustomer}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block">{t.customerName}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.enterName}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block">{t.mobileNumber}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={t.enterMobile}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-2"
          >
            <Check className="w-5 h-5" />
            {customer ? t.updateCustomer : t.addCustomer}
          </button>
        </form>
      </div>
    </div>
  );
}
