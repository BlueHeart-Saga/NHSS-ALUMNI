import React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

export const AuditHero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-[#FFF7D6] via-[#FFFDF5] to-[#FEF3C7] border border-[#F4C542]/40 rounded-3xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: icon + text */}
        <div className="lg:col-span-8 p-6 sm:p-10 flex items-start space-x-4 sm:space-x-6">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#F4C542] rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <FileText className="w-7 h-7 sm:w-10 sm:h-10 text-[#111111]" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight leading-tight">
              {t('audit_page_title')}
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed max-w-2xl">
              {t('audit_page_subtitle')}
            </p>
          </div>
        </div>

        {/* Right: accountability quote banner */}
        <div className="lg:col-span-4 relative bg-[#111111] text-white flex items-center p-6 sm:p-8">
          <div className="relative z-10">
            <div className="text-4xl text-[#F4C542] font-serif leading-none mb-2">"</div>
            <p className="text-sm sm:text-base font-semibold leading-snug text-white">
              {t('audit_accountability_quote')}
            </p>
            <p className="text-[11px] sm:text-xs text-[#F4C542] font-semibold mt-3 uppercase tracking-wider">
              — {t('audit_accountability_author')}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#F4C542]/10 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};