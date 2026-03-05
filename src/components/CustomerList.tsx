import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';
import { authFetch } from '../lib/authFetch';

interface Customer {
  id: number;
  name: string;
  mobile?: string;
  balance: number;
  last_transaction_date?: string;
  last_transaction_desc?: string;
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { refreshTrigger, language } = useApp();
  const t = translations[language];

  useEffect(() => {
    authFetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err));
  }, [refreshTrigger]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile?.includes(search)
  );

  const totalBalance = customers.reduce((acc, c) => acc + c.balance, 0);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 shadow-md z-10 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{t.appName}</h1>
          <div className="text-right">
            <p className="text-xs opacity-80">{t.netBalance}</p>
            <p className="text-lg font-bold">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-zinc-600">
            <UserPlus className="w-12 h-12 mb-2 opacity-20" />
            <p>{t.noCustomers}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-900">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => navigate(`/chat/${customer.id}`)}
                className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 active:bg-gray-100 dark:active:bg-zinc-900 transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 font-bold text-lg mr-4 shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100 truncate">{customer.name}</h3>
                    {customer.last_transaction_date && (
                      <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0 ml-2">
                        {formatDistanceToNow(new Date(customer.last_transaction_date), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-zinc-400 truncate max-w-[60%]">
                      {customer.last_transaction_desc || <span className="text-gray-400 dark:text-zinc-600 italic text-xs">—</span>}
                    </p>
                    
                    <div className={cn(
                      "font-bold text-sm flex items-center gap-0.5 px-2 py-0.5 rounded-full",
                      customer.balance > 0 
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" 
                        : customer.balance < 0 
                          ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20" 
                          : "text-gray-400 dark:text-zinc-600 bg-gray-50 dark:bg-zinc-900"
                    )}>
                      {customer.balance !== 0 && (
                        customer.balance > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />
                      )}
                      {formatCurrency(Math.abs(customer.balance))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
