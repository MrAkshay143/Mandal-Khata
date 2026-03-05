import { useState } from 'react';
import { MailCheck, RefreshCw, CheckCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VerificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationPopup({ isOpen, onClose }: VerificationPopupProps) {
  const { user } = useApp();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  if (!isOpen) return null;

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (res.ok) showMsg('Verification email sent. Please check your inbox.', 'success');
      else showMsg(data.error || 'Failed to send email.', 'error');
    } catch {
      showMsg('Network error. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem('mk_token');
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.emailVerified) {
        showMsg('Your email is verified! Please reload the page.', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showMsg('Email not yet verified. Please check your inbox.', 'error');
      }
    } catch {
      showMsg('Failed to check status.', 'error');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[320px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 px-5 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <MailCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">Email Verification Required</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Action needed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Please verify your email address before creating entries. A verification link was sent to{' '}
            <span className="font-semibold text-gray-800 dark:text-zinc-200">{user?.email}</span>.
          </p>

          {message && (
            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${
              msgType === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {msgType === 'success' ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
              {message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
            {sending ? 'Sending...' : 'Resend Verification Email'}
          </button>
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {checking
              ? <span className="w-4 h-4 border-2 border-gray-300/50 border-t-gray-600 rounded-full animate-spin" />
              : <CheckCircle className="w-4 h-4" />}
            {checking ? 'Checking...' : 'Check Verification Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
