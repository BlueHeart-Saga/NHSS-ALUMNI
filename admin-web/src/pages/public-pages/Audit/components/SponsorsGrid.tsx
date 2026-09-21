import React, { useEffect, useMemo, useState } from 'react';
import { HandHeart, ExternalLink, ArrowRight } from 'lucide-react';
import { Modal } from '../../../../components/Modal';
import { useLanguage } from '../../../../context/LanguageContext';
import type { Sponsor } from '../../../../types';
import { AuditSectionPagination } from './AuditSectionPagination';

interface Props {
  sponsors: Sponsor[];
  financialYear: string;
  onViewAll?: () => void;
  pageSize?: number;
}

export const SponsorsGrid: React.FC<Props> = ({ sponsors, financialYear, onViewAll, pageSize = 5 }) => {
  const { t, language } = useLanguage();
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB');
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalPages = Math.max(1, Math.ceil(sponsors.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageSponsors = useMemo(
    () => sponsors.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize),
    [sponsors, pageSize, safeCurrentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sponsors, financialYear, pageSize]);

  return (
    <div className="h-full bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
            <HandHeart className="w-4.5 h-4.5 text-[#854D0E]" strokeWidth={1.8} />
          </div>
          <h3 className="font-bold text-base text-[#111111]">
            {t('audit_sponsors_title')} ({financialYear})
          </h3>
        </div>
        {onViewAll && sponsors.length > 0 && (
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

      {sponsors.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500">
          {t('audit_sponsors_empty')}
        </div>
      ) : (
        <div className="flex-1 min-w-0 overflow-hidden">
          <table className="w-full table-fixed text-left text-[10px] sm:text-xs">
            <colgroup>
              <col className="w-[7%]" />
              <col className="w-[15%]" />
              <col className="w-[17%]" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[21%]" />
            </colgroup>
            <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="px-1 sm:px-2 py-3 font-bold">{t('audit_sponsors_col_serial')}</th>
                <th className="px-1 sm:px-2 py-3 font-bold">{t('audit_sponsors_col_date')}</th>
                <th className="px-1 sm:px-2 py-3 font-bold">{t('audit_sponsors_col_name')}</th>
                <th className="px-1 sm:px-2 py-3 font-bold">{t('audit_sponsors_col_sponsored_items')}</th>
                <th className="px-1 sm:px-2 py-3 font-bold text-right whitespace-nowrap">{t('audit_sponsors_col_budget')}</th>
                <th className="px-1 sm:px-2 py-3 font-bold text-right">{t('audit_sponsors_col_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {pageSponsors.map((sponsor, index) => {
                const displayName = language === 'ta' && sponsor.name_ta ? sponsor.name_ta : sponsor.name;
                return (
                  <tr key={sponsor.id} className="hover:bg-[#FFFDF2] transition-colors">
                    <td className="px-1 sm:px-2 py-3 text-[#6B7280] align-top">{(safeCurrentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-1 sm:px-2 py-3 text-[#4B5563] align-top break-words">{formatDate(sponsor.created_at)}</td>
                    <td className="px-1 sm:px-2 py-3 font-bold text-[#111111] align-top break-words">{displayName}</td>
                    <td className="px-1 sm:px-2 py-3 text-[#4B5563] align-top break-words [overflow-wrap:anywhere]">{sponsor.sponsored_item || 'N/A'}</td>
                    <td className="px-1 sm:px-2 py-3 text-right font-bold text-[#854D0E] align-top whitespace-nowrap">{formatAmount(sponsor.amount)}</td>
                    <td className="px-1 sm:px-2 py-3 text-right align-top">
                      <button
                        type="button"
                        onClick={() => setSelectedSponsor(sponsor)}
                        className="font-bold text-[#854D0E] hover:text-[#111111] hover:underline whitespace-nowrap"
                      >
                        {t('audit_sponsors_view_more')} &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AuditSectionPagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={sponsors.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={Boolean(selectedSponsor)}
        onClose={() => setSelectedSponsor(null)}
        title={t('audit_sponsors_detail_title')}
      >
        {selectedSponsor && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center p-2 shrink-0">
                {selectedSponsor.logo_url ? (
                  <img src={selectedSponsor.logo_url} alt={selectedSponsor.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[#854D0E] font-extrabold text-2xl">{selectedSponsor.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-[#111111]">{selectedSponsor.name}</h4>
                {selectedSponsor.name_ta && <p className="text-sm text-[#6B7280] mt-0.5">{selectedSponsor.name_ta}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div><span className="font-bold text-[#6B7280] block">{t('audit_sponsors_detail_date')}</span><span className="text-[#111111]">{formatDate(selectedSponsor.created_at)}</span></div>
              <div><span className="font-bold text-[#6B7280] block">{t('audit_sponsors_detail_financial_year')}</span><span className="text-[#111111]">{selectedSponsor.financial_year}</span></div>
              <div><span className="font-bold text-[#6B7280] block">{t('audit_sponsors_detail_amount')}</span><span className="text-[#854D0E] font-bold">{formatAmount(selectedSponsor.amount)}</span></div>
              <div><span className="font-bold text-[#6B7280] block">{t('audit_sponsors_detail_item')}</span><span className="text-[#111111]">{selectedSponsor.sponsored_item || 'N/A'}</span></div>
            </div>

            <div>
              <span className="font-bold text-[#6B7280] text-xs block mb-1">{t('audit_sponsors_detail_description')}</span>
              <p className="text-sm text-[#111111] whitespace-pre-wrap">{selectedSponsor.description || 'N/A'}</p>
            </div>

            {selectedSponsor.website_url && (
              <a href={selectedSponsor.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                {t('audit_sponsors_visit')} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};