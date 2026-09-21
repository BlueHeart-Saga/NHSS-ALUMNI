import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandCoins, Plus, TrendingUp } from 'lucide-react';
import { Button } from '../../components/Button';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import type { Contribution } from '../../types';

const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const PURPOSE_KEYS: Record<string, string> = {
  GENERAL: 'contribution_purpose_general',
  SCHOLARSHIP: 'contribution_purpose_scholarship',
  INFRASTRUCTURE: 'contribution_purpose_infrastructure',
  EVENT: 'contribution_purpose_event',
  OTHER: 'contribution_purpose_other',
};

const STATUS_KEYS: Record<string, string> = {
  PENDING: 'alumni_contributions_status_pending',
  COMPLETED: 'alumni_contributions_status_completed',
  REJECTED: 'alumni_contributions_status_rejected',
};

interface Props {
  embedded?: boolean;
  onMakeContribution?: () => void;
}

export const AlumniMyContributions: React.FC<Props> = ({ embedded = false, onMakeContribution }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyContributions()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = items.filter((c) => c.status === 'COMPLETED').reduce((s, c) => s + c.amount, 0);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {!embedded && <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
            <HandCoins className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">{t('alumni_contributions_title')}</h1>
            <p className="text-xs text-[#6B7280]">{t('alumni_contributions_subtitle')}</p>
          </div>
        </div>
        <Button onClick={() => embedded ? onMakeContribution?.() : navigate('/alumni/support/contribute')}>
          <Plus className="w-4 h-4 mr-1.5" />
          {t('alumni_contribute_title')}
        </Button>
      </div>}

      {total > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase">
              {t('alumni_contributions_total_label')}
            </p>
            <p className="text-xl font-extrabold text-[#111111]">₹ {fmtINR(total)}</p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={t('alumni_contributions_empty_title')}
          description={t('alumni_contributions_empty_desc')}
          action={<Button onClick={() => navigate('/alumni/support/contribute')}>{t('alumni_contribute_title')}</Button>}
        />
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="px-4 py-3">{t('alumni_contributions_col_date')}</th>
                  <th className="px-4 py-3 text-right">{t('alumni_contributions_col_amount')}</th>
                  <th className="px-4 py-3">{t('alumni_contributions_col_purpose')}</th>
                  <th className="px-4 py-3">{t('alumni_contributions_col_fy')}</th>
                  <th className="px-4 py-3">{t('alumni_contributions_col_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-xs">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-[#4B5563]">{c.contribution_date || '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#111111]">
                      {fmtINR(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {t(PURPOSE_KEYS[c.purpose || 'GENERAL'] || 'contribution_purpose_general')}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">{c.financial_year || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {t(STATUS_KEYS[c.status] || 'alumni_contributions_status_pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};