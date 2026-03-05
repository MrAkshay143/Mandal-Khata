import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, ReactNode } from 'react';
import { CustomerList } from './components/CustomerList';
import { CustomerChat } from './components/CustomerChat';
import { Summary } from './components/Summary';
import { Settings } from './components/Settings';
import { EntryModal } from './components/EntryModal';
import { CustomerModal } from './components/CustomerModal';
import { SplashScreen } from './components/SplashScreen';
import { HelpPage } from './components/HelpPage';
import { PrivacyPage } from './components/PrivacyPage';
import { AuthGuard } from './components/AuthGuard';
import { VerificationPopup } from './components/VerificationPopup';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmailVerifyPage } from './pages/EmailVerifyPage';
import { LayoutDashboard, Users, UserPlus, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { AppProvider, useApp } from './context/AppContext';
import { translations } from './lib/translations';

function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, user } = useApp();
  const t = translations[language];
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const { triggerRefresh } = useApp();

  // Listen for custom events to open modals
  useEffect(() => {
    const handleOpenEntry = () => {
      // Check email verification before allowing entry
      if (user && !user.emailVerified) {
        setShowVerificationPopup(true);
        return;
      }
      setIsEntryModalOpen(true);
    };
    const handleOpenCustomer = (e: CustomEvent) => {
      setEditingCustomer(e.detail?.customer || null);
      setIsCustomerModalOpen(true);
    };

    window.addEventListener('open-add-entry' as any, handleOpenEntry);
    window.addEventListener('open-customer-modal' as any, handleOpenCustomer);

    return () => {
      window.removeEventListener('open-add-entry' as any, handleOpenEntry);
      window.removeEventListener('open-customer-modal' as any, handleOpenCustomer);
    };
  }, [user]);

  const isChatScreen = location.pathname.startsWith('/chat/');
  const isFullScreenPage = isChatScreen || location.pathname === '/help' || location.pathname === '/privacy';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex justify-center transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-xl flex flex-col h-screen transition-colors">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col">
          {children}
        </div>

        {/* Bottom Navigation — always at the bottom, hidden on full-screen pages */}
        {!isFullScreenPage && (
          <div className="shrink-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-around py-3 z-40">
            <button
              onClick={() => navigate('/')}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-tighter transition-colors",
                location.pathname === '/' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300"
              )}
            >
              <Users className="w-5 h-5" />
              {t.customers}
            </button>
            <button
              onClick={() => navigate('/summary')}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-tighter transition-colors",
                location.pathname === '/summary' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              {t.summary}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-tighter transition-colors",
                location.pathname === '/settings' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300"
              )}
            >
              <SettingsIcon className="w-5 h-5" />
              {t.settings}
            </button>
          </div>
        )}

        {/* Floating Add Customer button — stays inside the max-w-md card */}
        {!isFullScreenPage && (
          <div
            className="fixed bottom-[72px] z-50 flex flex-col gap-3"
            style={{ right: 'max(16px, calc(50vw - 224px + 16px))' }}
          >
            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsCustomerModalOpen(true);
              }}
              className="bg-emerald-500 dark:bg-emerald-600 text-white p-3.5 rounded-full shadow-xl hover:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-95 transition-all"
              title="Add Customer"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modals */}
        <EntryModal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} />
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          customer={editingCustomer}
        />
        <VerificationPopup isOpen={showVerificationPopup} onClose={() => setShowVerificationPopup(false)} />
      </div>
    </div>
  );
}

function MainApp() {
  const [showSplash, setShowSplash] = useState(true);
  const { token } = useApp();

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex justify-center transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 min-h-screen shadow-xl relative overflow-hidden transition-colors">
          <SplashScreen onComplete={() => setShowSplash(false)} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/verify-email" element={<EmailVerifyPage />} />

        {/* Protected routes — wrapped in AuthGuard */}
        <Route path="/*" element={
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<CustomerList />} />
                <Route path="/chat/:customerId" element={<CustomerChat />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Routes>
            </Layout>
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
