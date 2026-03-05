import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { translations } from '../lib/translations';
import { ArrowUpRight, ArrowDownLeft, Clock, BarChart3, TrendingUp, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface DashboardData {
  totalToReceive: number;
  totalToPay: number;
  todayCount: number;
  todayGave: number;
  todayGot: number;
  monthCount: number;
  monthGave: number;
  monthGot: number;
  topPending: { id: number; name: string; balance: number }[];
  overdueCustomers: { id: number; name: string; balance: number; lastDate?: string }[];
  monthlyOverview: { month: string; gave: number; got: number }[];
  recentTransactions: { id: number; customer_name: string; type: 'GAVE' | 'GOT'; amount: number; description?: string; date: string }[];
}

export function Summary() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const { language } = useApp();
  const t = translations[language];
  const navigate = useNavigate();

  const load = () => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { load(); }, []);

  if (!stats) return (
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center dark:bg-zinc-950">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const netBalance = stats.totalToReceive - stats.totalToPay;
  const maxMonthly = Math.max(...stats.monthlyOverview.map(m => Math.max(m.gave, m.got)), 1);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 shadow-md shrink-0 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.financialSummary}</h1>
        <button onClick={load} className="p-1.5 hover:bg-emerald-700 rounded-full transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ① Main Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md">
            <div className="flex items-center gap-1.5 mb-2 opacity-80">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.youWillGet}</span>
            </div>
            <p className="text-xl font-bold truncate">{formatCurrency(stats.totalToReceive)}</p>
            <p className="text-[10px] opacity-70 mt-0.5 uppercase font-bold tracking-tighter">{t.totalReceivables}</p>
          </div>
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-md">
            <div className="flex items-center gap-1.5 mb-2 opacity-80">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t.youWillPay}</span>
            </div>
            <p className="text-xl font-bold truncate">{formatCurrency(stats.totalToPay)}</p>
            <p className="text-[10px] opacity-70 mt-0.5 uppercase font-bold tracking-tighter">{t.totalPayables}</p>
          </div>
        </div>

        {/* Net Balance strip */}
        <div className={cn(
          "rounded-xl px-4 py-2.5 flex items-center justify-between",
          netBalance >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30" : "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30"
        )}>
          <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{t.netBalance}</span>
          <span className={cn("text-base font-bold", netBalance >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </span>
        </div>

        {/* ② Today's Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {t.todayActivity}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-zinc-100">{stats.todayCount}</p>
              <p className="text-[9px] font-bold text-gray-500 dark:text-zinc-500 uppercase">Entries</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-red-700 dark:text-red-400 truncate">{formatCurrency(stats.todayGave)}</p>
              <p className="text-[9px] font-bold text-red-500 uppercase">{t.debit}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 truncate">{formatCurrency(stats.todayGot)}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase">{t.credit}</p>
            </div>
          </div>
        </div>

        {/* ③ Top Pending Customers */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            {t.topPending}
          </h3>
          {stats.topPending.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-zinc-600 text-center py-3">{t.noPending}</p>
          ) : (
            <div className="space-y-2">
              {stats.topPending.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl p-1.5 transition-colors"
                >
                  <span className="text-[10px] font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-zinc-400 shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-zinc-200 text-left truncate">{c.name}</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    c.balance > 0 ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                  )}>
                    {formatCurrency(Math.abs(c.balance))}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ④ Recent Transactions */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            {t.recentTransactions}
          </h3>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-zinc-600 text-center py-3">{t.noTransactions}</p>
          ) : (
            <div className="space-y-2">
              {stats.recentTransactions.slice(0, 8).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    tx.type === 'GAVE' ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {tx.type === 'GAVE' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate">{tx.customer_name}</p>
                    {tx.description && <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">{tx.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-xs font-bold", tx.type === 'GAVE' ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                      {tx.type === 'GAVE' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[9px] text-gray-400 dark:text-zinc-600">{formatDistanceToNow(new Date(tx.date), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ⑤ Monthly Overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            {t.monthlyOverview}
            <span className="ml-auto text-[10px] font-semibold text-gray-400 normal-case">This month: {stats.monthCount} entries</span>
          </h3>
          <div className="flex items-end gap-1.5 h-20">
            {stats.monthlyOverview.map((m) => {
              const gH = Math.round((m.gave / maxMonthly) * 100);
              const gtH = Math.round((m.got / maxMonthly) * 100);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: '60px' }}>
                    <div
                      className="w-2.5 rounded-t-sm bg-red-400 dark:bg-red-600 transition-all"
                      style={{ height: `${gH}%`, minHeight: m.gave > 0 ? '3px' : '0' }}
                      title={`Debit: ${formatCurrency(m.gave)}`}
                    />
                    <div
                      className="w-2.5 rounded-t-sm bg-emerald-400 dark:bg-emerald-600 transition-all"
                      style={{ height: `${gtH}%`, minHeight: m.got > 0 ? '3px' : '0' }}
                      title={`Credit: ${formatCurrency(m.got)}`}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-600">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-2 justify-center">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-400" /><span className="text-[9px] text-gray-500">{t.debit}</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-400" /><span className="text-[9px] text-gray-500">{t.credit}</span></div>
          </div>
        </div>

        {/* ⑥ Overdue Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {t.overdueSection}
          </h3>
          {stats.overdueCustomers.length === 0 ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-600">{t.noOverdue}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.overdueCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chat/${c.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-zinc-200 text-left truncate">{c.name}</span>
                  {c.lastDate && (
                    <span className="text-[9px] text-amber-600 dark:text-amber-400">
                      {formatDistanceToNow(new Date(c.lastDate), { addSuffix: true })}
                    </span>
                  )}
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">{formatCurrency(c.balance)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
}
