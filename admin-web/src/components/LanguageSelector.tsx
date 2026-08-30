import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#111111] text-xs sm:text-sm font-semibold rounded-lg border border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F4C542] cursor-pointer"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-[#854D0E] flex-shrink-0" />
        <span className="font-bold tracking-wide">
          {language === 'ta' ? 'தமிழ்' : 'ENG'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-xl border border-gray-200 z-50 overflow-hidden py-1 transform opacity-100 scale-100 transition-all duration-150">
          <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Choose Language / மொழி
          </div>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#F4C542]/20 text-[#111111] font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </span>
                {isSelected && <Check className="w-4 h-4 text-[#854D0E]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
