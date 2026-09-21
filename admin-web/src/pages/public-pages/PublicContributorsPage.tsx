import React, { useEffect, useState } from 'react';
import { ArrowLeft, HandCoins } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import type { TopContributor } from '../../types';
import { EmptyState, LoadingState } from '../../components/EmptyState';

const currentIndianFY = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 3 ? `${year} - ${year + 1}` : `${year - 1} - ${year}`;
};

const fmtINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);

export const PublicContributorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [financialYear, setFinancialYear] = useState(searchParams.get('financial_year') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const requestedFY = searchParams.get('financial_year');
        const fy = requestedFY || (await api.getPublicLatestContributionFY()).financial_year || currentIndianFY();
        const data = await api.getPublicTopContributors(fy, 1000);
        if (!mounted) return;
        setFinancialYear(fy);
        setContributors(data || []);
      } catch (err) {
        console.error('[PublicContributorsPage] contributors fetch failed:', err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [searchParams]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-fadeIn">
        <button
          type="button"
          onClick={() => navigate('/audit')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('audit_back_to_audit')}</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
            <HandCoins className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
              {t('audit_top_contributors_title')}
            </h1>
            <p className="text-xs text-[#6B7280]">{financialYear || currentIndianFY()}</p>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="border border-red-200 rounded-2xl p-8 text-center text-sm text-red-700">
            Unable to load public contributors right now.
          </div>
        ) : contributors.length === 0 ? (
          <EmptyState
            title={t('audit_top_contributors_empty')}
            description=""
          />
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="px-4 py-3 w-12">{t('audit_col_sno')}</th>
                    <th className="px-4 py-3">{t('audit_col_name')}</th>
                    <th className="px-4 py-3 w-24">{t('audit_col_batch')}</th>
                    <th className="px-4 py-3 w-40 text-right">{t('audit_col_amount')}</th>
                    <th className="px-4 py-3 w-36">{t('audit_col_date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-sm">
                  {contributors.map((contributor, index) => (
                    <tr key={contributor.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 text-[#6B7280] font-medium">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-[#111111]">
                        {language === 'ta' && contributor.name_ta ? contributor.name_ta : contributor.name}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">{contributor.batch || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#111111]">
                        {fmtINR(contributor.amount)}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">{contributor.contribution_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};