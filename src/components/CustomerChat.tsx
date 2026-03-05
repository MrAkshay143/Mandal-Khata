import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Bell, Send, ArrowUpRight, ArrowDownLeft,
  Edit2, Trash2, Share2, X, MessageSquare, Check
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { format, isToday, isYesterday, isTomorrow, startOfDay } from 'date-fns';
import { useApp } from '../context/AppContext';
import { translations, type TranslationType } from '../lib/translations';

interface Transaction {
  id: number;
  type: 'GAVE' | 'GOT';
  amount: number;
  description?: string;
  date: string;
  running_balance?: number;
}

interface Customer {
  id: number;
  name: string;
  mobile?: string;
  balance: number;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CustomerChat() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const selectionMode = selectedIds.size > 0;

  // Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { refreshTrigger, triggerRefresh, language } = useApp();
  const t = translations[language];

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/transactions/${customerId}`)
      .then(res => res.json())
      .then(data => {
        setCustomer(data.customer);
        let balance = 0;
        const withBalance = data.transactions.map((tx: Transaction) => {
          balance += tx.type === 'GAVE' ? tx.amount : -tx.amount;
          return { ...tx, running_balance: balance };
        });
        setTransactions(withBalance);
        setLoading(false);
      })
      .catch(console.error);
  }, [customerId, refreshTrigger]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transactions]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());

  // ── Share helpers ──────────────────────────────────────────────────────────
  const buildShareMessage = (txList: Transaction[]) => {
    if (!customer) return '';
    if (txList.length === 1) {
      const tx = txList[0];
      const dateStr = format(new Date(tx.date), 'dd-MM-yyyy hh:mm a');
      const typeStr = tx.type === 'GAVE' ? t.creditGiven : t.paymentReceived;
      return t.entryMsg
        .replace('{name}', customer.name)
        .replace('{type}', typeStr)
        .replace('{amount}', formatCurrency(tx.amount))
        .replace('{date}', dateStr)
        .replace('{note}', tx.description || '-')
        .replace('{balance}', formatCurrency(tx.running_balance || 0));
    }
    // Multiple entries
    let text = `${t.ledgerTitle}\n${t.customerName}: *${customer.name}*\n--------------------------\n`;
    txList.forEach(tx => {
      const d = format(new Date(tx.date), 'dd/MM');
      const sign = tx.type === 'GAVE' ? '(-)' : '(+)';
      text += `${d} | ${sign} ${formatCurrency(tx.amount)} | ${tx.description || '-'}\n`;
    });
    text += `--------------------------\n${t.generatedVia}`;
    return text;
  };

  const handleShareLedger = () => {
    if (!customer || transactions.length === 0) return;
    let text = `${t.ledgerTitle}\n${t.customerName}: *${customer.name}*\n${t.date}: ${format(new Date(), 'dd-MM-yyyy')}\n--------------------------\n`;
    transactions.forEach(tx => {
      const d = format(new Date(tx.date), 'dd/MM');
      const sign = tx.type === 'GAVE' ? '(-)' : '(+)';
      text += `${d} | ${sign} ${formatCurrency(tx.amount)} | ${tx.description || '-'}\n`;
    });
    text += `--------------------------\n*${t.closingBalance}: ${formatCurrency(customer.balance)}*\n\n${t.generatedVia}`;
    setShareMessage(text);
    setIsShareModalOpen(true);
  };

  const handleSendReminder = () => {
    if (!customer) return;
    const bal = customer.balance;
    const dateStr = format(new Date(), 'dd/MM/yyyy');
    let msg = '';
    if (bal > 0) msg = t.reminderMsgGave.replace('{name}', customer.name).replace('{amount}', formatCurrency(Math.abs(bal))).replace('{date}', dateStr);
    else if (bal < 0) msg = t.reminderMsgGot.replace('{name}', customer.name).replace('{amount}', formatCurrency(Math.abs(bal))).replace('{date}', dateStr);
    else msg = t.reminderMsgClear.replace('{name}', customer.name);
    setShareMessage(msg);
    setIsShareModalOpen(true);
  };

  // ── Action bar handlers ────────────────────────────────────────────────────
  const handleHeaderEdit = () => {
    if (selectedIds.size !== 1) return;
    const tx = transactions.find(tx => tx.id === [...selectedIds][0]);
    if (!tx) return;
    clearSelection();
    window.dispatchEvent(new CustomEvent('open-add-entry', {
      detail: { customerId: Number(customerId), transaction: tx }
    }));
  };

  const handleHeaderShare = () => {
    const selected = transactions.filter(tx => selectedIds.has(tx.id));
    if (!selected.length) return;
    setShareMessage(buildShareMessage(selected));
    setIsShareModalOpen(true);
    clearSelection();
  };

  const handleHeaderDelete = () => setDeleteConfirmOpen(true);

  const confirmDelete = async () => {
    try {
      await Promise.all(
        [...selectedIds].map(id => fetch(`/api/transactions/${id}`, { method: 'DELETE' }))
      );
      setDeleteConfirmOpen(false);
      clearSelection();
      triggerRefresh();
    } catch {
      setDeleteConfirmOpen(false);
    }
  };

  const formatDateDivider = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return t.today;
    if (isYesterday(d)) return t.yesterday;
    if (isTomorrow(d)) return t.tomorrow;
    return format(d, 'dd MMMM yyyy');
  };

  if (loading) return <div className="p-4 text-center dark:text-zinc-400">{t.loading}</div>;
  if (!customer) return <div className="p-4 text-center dark:text-zinc-400">{t.customerNotFound}</div>;

  const grouped: { [k: string]: Transaction[] } = {};
  transactions.forEach(tx => {
    const key = format(startOfDay(new Date(tx.date)), 'yyyy-MM-dd');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-zinc-950 transition-colors">

      {/* ── Header ── */}
      <div className="bg-emerald-600 text-white p-3 flex items-center shadow-md z-30 shrink-0 min-h-[56px]">
        {selectionMode ? (
          /* Selection mode header */
          <>
            <button onClick={clearSelection} className="mr-2 p-1 hover:bg-emerald-700 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <span className="flex-1 font-bold text-base">{selectedIds.size} selected</span>
            <div className="flex items-center gap-1">
              {selectedIds.size === 1 && (
                <button
                  onClick={handleHeaderEdit}
                  className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleHeaderShare}
                className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleHeaderDelete}
                className="p-2 hover:bg-red-500 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* Normal header */
          <>
            <button onClick={() => navigate('/')} className="mr-2 p-1 hover:bg-emerald-700 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div
              className="flex-1 flex items-center cursor-pointer hover:bg-emerald-700/50 p-1 rounded-lg transition-colors overflow-hidden"
              onClick={() => window.dispatchEvent(new CustomEvent('open-customer-modal', { detail: { customer } }))}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold mr-3 shrink-0 text-sm">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base leading-tight truncate">{customer.name}</h2>
                {customer.mobile && <p className="text-[10px] opacity-80">{customer.mobile}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-right mr-1 shrink-0">
                <p className="text-[10px] opacity-80 uppercase font-bold tracking-tighter">{t.balance}</p>
                <p className={cn('font-bold text-xs', customer.balance >= 0 ? 'text-white' : 'text-red-200')}>
                  {formatCurrency(customer.balance)}
                </p>
              </div>
              <button onClick={handleSendReminder} className="p-1.5 hover:bg-emerald-700 rounded-full" title={t.sendReminder}>
                <Bell className="w-5 h-5" />
              </button>
              <a href={`tel:${customer.mobile}`} className="p-1.5 hover:bg-emerald-700 rounded-full">
                <Phone className="w-5 h-5" />
              </a>
              <button onClick={handleShareLedger} className="p-1.5 hover:bg-emerald-700 rounded-full" title={t.shareLedger}>
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100 dark:bg-zinc-950">
        {Object.entries(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-zinc-600">
            <Send className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">{t.noTransactions}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateKey, txs]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date divider */}
              <div className="flex justify-center">
                <div className="text-[10px] font-bold text-gray-600 dark:text-zinc-400 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm py-1 px-3 rounded-full shadow-sm uppercase tracking-wider">
                  {formatDateDivider(dateKey)}
                </div>
              </div>

              {txs.map(tx => (
                <BubbleItem
                  key={tx.id}
                  tx={tx}
                  t={t}
                  isSelected={selectedIds.has(tx.id)}
                  selectionMode={selectionMode}
                  onTap={() => toggleSelect(tx.id)}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="shrink-0 bg-white dark:bg-zinc-900 px-3 py-2.5 border-t border-gray-200 dark:border-zinc-800 flex gap-2 z-40">
        <button
          className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95 shadow-sm text-xs uppercase tracking-wider border border-red-100 dark:border-red-900/30"
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-entry', { detail: { customerId: Number(customerId), type: 'GAVE' } }))}
        >
          <ArrowUpRight className="w-4 h-4" />{t.debit}
        </button>
        <button
          className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors active:scale-95 shadow-sm text-xs uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30"
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-entry', { detail: { customerId: Number(customerId), type: 'GOT' } }))}
        >
          <ArrowDownLeft className="w-4 h-4" />{t.credit}
        </button>
      </div>

      {/* ── Delete Confirmation ── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 pt-6 pb-5 text-center">
              <p className="font-bold text-gray-900 dark:text-zinc-100 text-base">
                Delete selected entries?
              </p>
            </div>
            <div className="flex border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t.cancel}
              </button>
              <div className="w-px bg-gray-100 dark:bg-zinc-800" />
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      <ShareOptionsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        message={shareMessage}
        mobile={customer.mobile}
      />
    </div>
  );
}

// ─── Bubble Item component ────────────────────────────────────────────────────
function BubbleItem({
  tx, t, isSelected, selectionMode, onTap,
}: {
  key?: React.Key;
  tx: Transaction;
  t: TranslationType;
  isSelected: boolean;
  selectionMode: boolean;
  onTap: () => void;
}) {
  const isGave = tx.type === 'GAVE';

  return (
    <div
      onClick={onTap}
      onContextMenu={(e) => { e.preventDefault(); onTap(); }}
      className={cn(
        'flex items-end gap-2 transition-all duration-150 cursor-pointer',
        isGave ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Checkbox indicator in selection mode */}
      {selectionMode && (
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mb-1 transition-all',
          isSelected
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
        )}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[82%] px-3 py-2.5 rounded-2xl shadow-sm border select-none transition-all duration-150',
          isGave
            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 rounded-tr-sm'
            : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 rounded-tl-sm',
          isSelected
            ? 'ring-2 ring-emerald-500 ring-offset-1 opacity-100'
            : 'opacity-100 active:scale-[0.98]',
        )}
      >
        {/* Type + time */}
        <div className="flex justify-between items-center mb-1 gap-3">
          <span className={cn(
            'text-[10px] font-bold uppercase tracking-wider',
            isGave ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {isGave ? t.debit : t.credit}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500">{format(new Date(tx.date), 'hh:mm a')}</span>
        </div>

        {/* Amount */}
        <div className={cn('text-base font-bold mb-0.5', isGave ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300')}>
          {formatCurrency(tx.amount)}
        </div>

        {/* Note */}
        {tx.description && (
          <p className="text-xs text-gray-600 dark:text-zinc-400 mb-1 italic border-l-2 border-gray-300 dark:border-zinc-700 pl-1.5 line-clamp-2">
            {tx.description}
          </p>
        )}

        {/* Running balance */}
        <div className="border-t border-gray-200/50 dark:border-zinc-800 pt-0.5 mt-0.5 flex justify-between items-center text-[10px] text-gray-500 dark:text-zinc-500">
          <span>{t.balance}:</span>
          <span className="font-semibold">{formatCurrency(tx.running_balance || 0)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareOptionsModal({ isOpen, onClose, message, mobile }: {
  isOpen: boolean; onClose: () => void; message: string; mobile?: string;
}) {
  const { language } = useApp();
  const t = translations[language];
  if (!isOpen) return null;

  const share = (via: 'whatsapp' | 'sms') => {
    const encoded = encodeURIComponent(message);
    const clean = mobile?.replace(/\D/g, '') || '';
    if (via === 'whatsapp') {
      const url = clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
      window.open(url, '_blank');
    } else {
      if (clean) { window.open(`sms:${clean}?body=${encoded}`, '_blank'); }
      else if (navigator.share) navigator.share({ text: message }).catch(() => {});
      else navigator.clipboard.writeText(message);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[260px] rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 mb-3 text-center">{t.shareVia}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => share('whatsapp')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{t.whatsapp}</span>
          </button>
          <button onClick={() => share('sms')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">{t.textMsg}</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-3 py-2 text-sm text-gray-500 dark:text-zinc-500 font-bold hover:text-gray-800 dark:hover:text-zinc-300 transition-colors">
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
