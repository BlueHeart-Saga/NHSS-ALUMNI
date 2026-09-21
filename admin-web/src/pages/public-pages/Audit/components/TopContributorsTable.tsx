import React, { useEffect, useMemo, useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import type { TopContributor } from '../../../../types';
import { AuditSectionPagination } from './AuditSectionPagination';

interface Props {
  contributors: TopContributor[];
  financialYear: string;
  onViewAll: () => void;
}

const fmtINR = (n: number): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

export const TopContributorsTable: React.FC<Props> = ({ contributors, financialYear, onViewAll }) => {
  const { t, language } = useLanguage();
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(contributors.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageContributors = useMemo(
    () => contributors.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize),
    [contributors, safeCurrentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [contributors, financialYear]);

  return (
    <div className="h-full bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-[#854D0E]" strokeWidth={1.8} />
          </div>
          <h3 className="font-bold text-base text-[#111111]">
            {t('audit_top_contributors_title')} ({financialYear})
          </h3>
        </div>
        {contributors.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-amber-700 inline-flex items-center space-x-1"
          >
            <span>{t('audit_top_contributors_view_all')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {contributors.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500">
          {t('audit_top_contributors_empty')}
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          {/* Balanced, near-even column distribution.
              S.NO (8%) | NAME (26%) | BATCH (14%) | AMOUNT (22%) | DATE (30%)
              Total = 100%. Narrow enough to avoid the wide NAME gap and wide
              enough on AMOUNT/DATE so they read as clearly separate columns. */}
          <table className="w-full table-fixed text-left border-collapse">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[26%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="px-3 py-3">{t('audit_col_sno')}</th>
                <th className="px-3 py-3">{t('audit_col_name')}</th>
                <th className="px-3 py-3">{t('audit_col_batch')}</th>
                <th className="px-3 py-3">{t('audit_col_amount')}</th>
                <th className="px-3 py-3">{t('audit_col_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-sm">
              {pageContributors.map((c, i) => (
                <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-3 py-3 text-[#6B7280] font-medium">
                    {(safeCurrentPage - 1) * pageSize + i + 1}
                  </td>
                  <td className="px-3 py-3 font-semibold text-[#111111] truncate">
                    {language === 'ta' && c.name_ta ? c.name_ta : c.name}
                  </td>
                  <td className="px-3 py-3 text-[#4B5563]">{c.batch || '—'}</td>
                  <td className="px-3 py-3 font-bold text-[#111111]">{fmtINR(c.amount)}</td>
                  <td className="px-3 py-3 text-[#4B5563]">{c.contribution_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AuditSectionPagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={contributors.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};