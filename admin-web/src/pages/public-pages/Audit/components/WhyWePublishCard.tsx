import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

export const WhyWePublishCard: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    t('audit_why_check_1'),
    t('audit_why_check_2'),
    t('audit_why_check_3'),
    t('audit_why_check_4'),
  ];

  return (
    <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl p-5 sm:p-6 shadow-sm h-full">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 bg-[#1E40AF] rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <h3 className="font-extrabold text-base sm:text-lg text-[#1E3A8A] leading-tight pt-1">
          {t('audit_why_title')}
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-[#1E3A8A]/85 leading-relaxed mb-5">
        {t('audit_why_body')}
      </p>

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 fill-emerald-100" />
            <span className="text-xs sm:text-sm text-[#1E3A8A] font-medium leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};