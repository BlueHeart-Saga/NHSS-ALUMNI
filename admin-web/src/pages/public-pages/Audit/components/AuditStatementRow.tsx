import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import type { AuditStatementListSummary } from '../../../../types';

interface Props {
  statement: AuditStatementListSummary;
  onReadMore: () => void;
}

export const AuditStatementRow: React.FC<Props> = ({ statement, onReadMore }) => {
  const { t, language } = useLanguage();
  const displayTitle = language === 'ta' && statement.title_ta ? statement.title_ta : statement.title;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-[#F4C542] hover:shadow-md transition-all">
      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#854D0E]" strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm sm:text-base text-[#111111] leading-snug">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
          {statement.period_start} - {statement.period_end}
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F6]">
        {statement.posted_date && (
          <p className="text-[11px] sm:text-xs text-[#6B7280] font-medium whitespace-nowrap">
            {t('audit_label_posted_on')} {statement.posted_date}
          </p>
        )}
        <button
          type="button"
          onClick={onReadMore}
          className="inline-flex items-center space-x-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0 active:scale-[0.97]"
        >
          <span>{t('audit_read_more')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};