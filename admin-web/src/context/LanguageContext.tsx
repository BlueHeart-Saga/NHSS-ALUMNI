import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../i18n/translations';
import { getAssetUrl } from '../utils/asset';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  logoUrl: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'ta' || saved === 'en') ? saved : 'ta';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const dict = translations[language] || translations['ta'];
    return dict[key] || translations['en']?.[key] || key;
  };

  const logoUrl = language === 'ta' 
    ? getAssetUrl('/assets/logo/logo_tamil.png') 
    : getAssetUrl('/assets/logo/logo_eglish.png');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, logoUrl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
