import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'bn' | 'hi';
export type Theme = 'light' | 'dark';

interface AppContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  ownerName: string;
  setOwnerName: (name: string) => void;
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
  const [ownerName, setOwnerName] = useState(() => {
    return localStorage.getItem('mandal-khata-owner') || 'Akshay Mondal';
  });

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    localStorage.setItem('mandal-khata-lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mandal-khata-owner', ownerName);
  }, [ownerName]);

  useEffect(() => {
    localStorage.setItem('mandal-khata-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppContext.Provider value={{ 
      refreshTrigger, 
      triggerRefresh, 
      language, 
      setLanguage, 
      theme, 
      setTheme,
      ownerName,
      setOwnerName
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
