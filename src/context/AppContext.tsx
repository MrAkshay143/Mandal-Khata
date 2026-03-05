import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'bn' | 'hi';
export type Theme = 'light' | 'dark';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
}

interface AppContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  ownerName: string;
  setOwnerName: (name: string) => void;
  // Auth
  token: string | null;
  user: AppUser | null;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mandal-khata-lang') as Language) || 'en';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('mandal-khata-theme') as Theme) || 'light';
  });

  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mk_token'));
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('mk_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Owner name derived from user
  const ownerName = user?.name || 'User';
  const setOwnerName = (_name: string) => {}; // No-op, name comes from server

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const login = (newToken: string, newUser: AppUser) => {
    localStorage.setItem('mk_token', newToken);
    localStorage.setItem('mk_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('mk_token');
    localStorage.removeItem('mk_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    localStorage.setItem('mandal-khata-lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mandal-khata-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Refresh user info from server if token exists
  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { logout(); return null; }
        return res.json();
      })
      .then(data => {
        if (data && data.id) {
          const updated: AppUser = { id: data.id, name: data.name, email: data.email, emailVerified: data.emailVerified };
          setUser(updated);
          localStorage.setItem('mk_user', JSON.stringify(updated));
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <AppContext.Provider value={{
      refreshTrigger,
      triggerRefresh,
      language,
      setLanguage,
      theme,
      setTheme,
      ownerName,
      setOwnerName,
      token,
      user,
      login,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
