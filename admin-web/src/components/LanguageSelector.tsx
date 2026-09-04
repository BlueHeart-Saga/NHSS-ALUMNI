import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center bg-gray-100 p-0.5 sm:p-1 rounded-2xl border-2 border-[#E5E7EB] shadow-2xs shrink-0">
      <button
        type="button"
        onClick={() => setLanguage('ta')}
        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-w-[36px] sm:min-w-[44px] text-center ${
          language === 'ta'
            ? 'bg-[#111111] text-[#F4C542] shadow-sm border border-[#F4C542]/50 scale-[1.02]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        தமிழ்
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-w-[36px] sm:min-w-[44px] text-center ${
          language === 'en'
            ? 'bg-[#111111] text-[#F4C542] shadow-sm border border-[#F4C542]/50 scale-[1.02]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
        }`}
      >
        ENG
      </button>
    </div>
  );
};
