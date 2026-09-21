import React, { useEffect, useState } from 'react';
import { ArrowLeft, HandHeart } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import type { Sponsor } from '../../types';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { SponsorsGrid } from './Audit/components/SponsorsGrid';

const currentIndianFY = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() >= 3 ? `${year} - ${year + 1}` : `${year - 1} - ${year}`;
};

export const PublicSponsorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [financialYear, setFinancialYear] = useState(searchParams.get('financial_year') || currentIndianFY());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const requestedFY = searchParams.get('financial_year');
    const fy = requestedFY || currentIndianFY();
    setLoading(true);
    api.getPublicSponsors(fy)
      .then((data) => {
        if (!mounted) return;
        setFinancialYear(fy);
        setSponsors(data || []);
      })
      .catch((err) => {
        console.error('[PublicSponsorsPage] sponsors fetch failed:', err);
        if (mounted) setSponsors([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [searchParams]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-fadeIn">
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
            <HandHeart className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
              {t('audit_sponsors_title')}
            </h1>
            <p className="text-xs text-[#6B7280]">{financialYear}</p>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : sponsors.length === 0 ? (
          <EmptyState title={t('audit_sponsors_empty')} description="" />
        ) : (
          <SponsorsGrid sponsors={sponsors} financialYear={financialYear} pageSize={10} />
        )}
      </div>
    </div>
  );
};
