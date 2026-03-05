import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Language } from '../context/AppContext';
import { translations } from '../lib/translations';
import {
  Moon,
  Sun,
  Languages,
  ShieldCheck,
  Info,
  Database,
  HelpCircle,
  ChevronRight,
  User,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { authFetch } from '../lib/authFetch';
import { ConfirmDialog } from './ConfirmDialog';

// Toast component
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={cn(
      "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl text-white text-xs font-semibold animate-in slide-in-from-bottom-4 duration-300 max-w-[90vw]",
      type === 'success' ? "bg-emerald-600" : "bg-red-600"
    )}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, user, logout } = useApp();
  const t = translations[language];
  const ownerName = user?.name || 'User';
  const [showBackup, setShowBackup] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: t.english },
    { code: 'bn', label: t.bengali },
    { code: 'hi', label: t.hindi },
  ];

  const handleBackup = async () => {
    try {
      const customersRes = await authFetch('/api/customers');
      const customers = await customersRes.json();
      const entriesRes = await authFetch('/api/entries');
      const entries = await entriesRes.json();
      const backupData = { customers, entries, ownerName, language, theme, timestamp: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mandal-khata-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(t.backupSuccess, 'success');
    } catch (err) {
      console.error(err);
      showToast('Backup failed', 'error');
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.customers || !data.entries) throw new Error('Invalid format');
        const res = await authFetch('/api/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Restore failed');
        showToast(t.restoreSuccess, 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        showToast(t.restoreError, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-zinc-950 transition-colors">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-4 shadow-md shrink-0 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.settings}</h1>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        <ConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            logout();
            window.location.href = '/login';
          }}
          title="Log out"
          message="Are you sure you want to log out from this device?"
          confirmLabel="Log out"
          variant="danger"
          icon={<LogOut className="w-6 h-6" />}
        />
        {/* Profile Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg truncate">{ownerName}</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{user?.email}</p>
              {user && !user.emailVerified && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">⚠ Email not verified</span>
              )}
              {user?.emailVerified && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">✓ Verified</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Appearance */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-1">{t.appearance}</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            {/* Theme */}
            <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <span className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{t.theme}</span>
              </div>
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setTheme('light')}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", theme === 'light' ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-zinc-500")}
                >
                  {t.light}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", theme === 'dark' ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 dark:text-zinc-500")}
                >
                  {t.dark}
                </button>
              </div>
            </div>
            {/* Language */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Languages className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{t.language}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border-2 transition-all",
                      language === lang.code
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-500"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data & Security */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-1">{t.dataSecurity}</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <button
              onClick={() => setShowBackup(!showBackup)}
              className="w-full p-4 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{t.backupRestore}</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", showBackup && "rotate-90")} />
            </button>
            {showBackup && (
              <div className="px-4 pb-4 pt-3 bg-gray-50 dark:bg-zinc-800/30 space-y-2">
                <button
                  onClick={handleBackup}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:border-emerald-500 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  {t.backup}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:border-emerald-500 transition-colors"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  {t.restore}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
              </div>
            )}
            <button onClick={() => navigate('/privacy')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{t.privacyPolicy}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Support & About */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-1">{t.supportAbout}</h3>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <button onClick={() => navigate('/help')} className="w-full p-4 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{t.helpSupport}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-zinc-300 block text-sm">{t.about}</span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500">{t.version} 2.2.0</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Mandal Khata</span>
            </div>
          </div>
        </div>

        <div className="text-center pb-4">
          <p className="text-[10px] text-gray-400 dark:text-zinc-600 font-medium">{t.developedBy}</p>
        </div>
      </div>
    </div>
  );
}
