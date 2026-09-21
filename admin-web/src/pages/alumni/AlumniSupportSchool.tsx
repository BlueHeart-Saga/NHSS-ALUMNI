import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HandCoins,
  HandHeart,
  HeartHandshake,
  Activity,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/EmptyState';
import { AlumniContribute } from './AlumniContribute';
import { AlumniMyContributions } from './AlumniMyContributions';
import { AlumniSponsors } from './AlumniSponsors';
import { TopContributorsTable } from '../public-pages/Audit/components/TopContributorsTable';
import type { Contribution, Sponsor, TopContributor } from '../../types';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

/** Indian FY: 1 April → 31 March. Mirrors AuditListPage logic. */
const currentIndianFY = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 4 ? `${y} - ${y + 1}` : `${y - 1} - ${y}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab type — exactly three internal pages
// ─────────────────────────────────────────────────────────────────────────────
type SupportTab = 'activities' | 'contribution' | 'sponsors';

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — MY ACTIVITIES (only current user's own data)
// ─────────────────────────────────────────────────────────────────────────────
const MyActivitiesPage: React.FC = () => {
  const { t } = useLanguage();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.getMyContributions().catch(() => [] as Contribution[]),
      api.getMySponsors().catch(() => [] as Sponsor[]),
    ])
      .then(([c, s]) => {
        if (!mounted) return;
        setContributions(c);
        setSponsors(s);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const completed = useMemo(
    () => contributions.filter((c) => c.status === 'COMPLETED'),
    [contributions]
  );
  const totalContrib = useMemo(
    () => completed.reduce((s, c) => s + c.amount, 0),
    [completed]
  );
  const totalSponsor = useMemo(
    () => sponsors.reduce((s, x) => s + (x.amount || 0), 0),
    [sponsors]
  );

  if (loading) return <LoadingState />;

  const statusBadge = (status: string) => {
    const styles =
      status === 'COMPLETED'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : status === 'REJECTED'
        ? 'bg-rose-50 text-rose-800 border-rose-200'
        : 'bg-amber-50 text-amber-800 border-amber-200';
    return (
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
          <Activity className="w-4 h-4 text-[#854D0E]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#111111]">
            {t('alumni_support_section_my_activities')}
          </h2>
          <p className="text-xs text-[#6B7280]">
            {t('alumni_support_my_activities_subtitle')}
          </p>
        </div>
      </div>

      {/* Two side-by-side compact summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MY CONTRIBUTIONS */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg flex items-center justify-center">
                <HandCoins className="w-4 h-4 text-[#854D0E]" />
              </div>
              <h3 className="font-bold text-sm text-[#111111]">
                {t('alumni_my_contributions_title')}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#854D0E]">
              ₹ {fmtINR(totalContrib)}
            </span>
          </div>

          {contributions.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-4 text-center">
              {t('alumni_contributions_empty_title')}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left border-collapse min-w-[420px]">
                <thead>
                  <tr className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                    <th className="px-2 py-2">{t('alumni_contributions_col_date')}</th>
                    <th className="px-2 py-2 text-right">{t('alumni_contributions_col_amount')}</th>
                    <th className="px-2 py-2">{t('alumni_contributions_col_purpose')}</th>
                    <th className="px-2 py-2">{t('alumni_contributions_col_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-xs">
                  {contributions.slice(0, 4).map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-2 py-2 text-[#4B5563]">{c.contribution_date || '—'}</td>
                      <td className="px-2 py-2 text-right font-bold text-[#111111]">
                        {fmtINR(c.amount)}
                      </td>
                      <td className="px-2 py-2 text-[#4B5563]">{c.purpose || '—'}</td>
                      <td className="px-2 py-2">{statusBadge(c.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MY SPONSORS */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg flex items-center justify-center">
                <HandHeart className="w-4 h-4 text-[#854D0E]" />
              </div>
              <h3 className="font-bold text-sm text-[#111111]">
                {t('alumni_my_sponsors_title')}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#854D0E]">
              ₹ {fmtINR(totalSponsor)}
            </span>
          </div>

          {sponsors.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-4 text-center">
              {t('alumni_my_sponsors_empty')}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left border-collapse min-w-[420px]">
                <thead>
                  <tr className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                    <th className="px-2 py-2">{t('alumni_contributions_col_date')}</th>
                    <th className="px-2 py-2">{t('alumni_sponsors_item')}</th>
                    <th className="px-2 py-2 text-right">{t('alumni_sponsors_amount')}</th>
                    <th className="px-2 py-2">{t('alumni_contributions_col_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-xs">
                  {sponsors.slice(0, 4).map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-2 py-2 text-[#4B5563]">
                        {s.created_at?.slice(0, 10) || s.financial_year || '—'}
                      </td>
                      <td className="px-2 py-2 text-[#4B5563]">{s.sponsored_item || '—'}</td>
                      <td className="px-2 py-2 text-right font-bold text-[#111111]">
                        {s.amount != null ? fmtINR(s.amount) : '—'}
                      </td>
                      <td className="px-2 py-2">
                        {statusBadge(s.is_published ? 'COMPLETED' : 'PENDING')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — CONTRIBUTION (make / my / top contributors)
// ─────────────────────────────────────────────────────────────────────────────
const ContributionPage: React.FC<{
  onFormSubmitted: () => void;
  myContribKey: number;
}> = ({ onFormSubmitted, myContribKey }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);

  // Top Contributors — reuse Audit data source
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [topContributorsFY, setTopContributorsFY] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .getPublicLatestContributionFY()
      .then((res) => mounted && setTopContributorsFY(res?.financial_year || currentIndianFY()))
      .catch(() => mounted && setTopContributorsFY(currentIndianFY()));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!topContributorsFY) return;
    let mounted = true;
    setLoading(true);
    api
      .getPublicTopContributors(topContributorsFY, 1000)
      .then((data) => mounted && setTopContributors(data || []))
      .catch(() => mounted && setTopContributors([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [topContributorsFY]);

  return (
    <div className="space-y-6">
      {/* 1. MAKE A CONTRIBUTION CTA */}
      <div className="bg-gradient-to-r from-[#FFFDF5] via-white to-[#FFFDF5] border border-[#F4C542]/40 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="w-11 h-11 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-[#111111]">
              {t('alumni_support_cta_make_contribution')}
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              {t('alumni_support_make_contribution_subtitle')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto shrink-0 shadow-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t('alumni_support_cta_make_contribution')}
        </Button>
      </div>

      {/* 2. MY CONTRIBUTIONS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#111111]">
              {t('alumni_contributions_title')}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {t('alumni_contributions_subtitle')}
            </p>
          </div>
        </div>
        <AlumniMyContributions
          key={myContribKey}
          embedded
          onMakeContribution={() => setFormOpen(true)}
        />
      </div>

      {/* 3. TOP CONTRIBUTORS (reuses Audit data source) */}
      <div>
        {loading ? (
          <LoadingState />
        ) : (
          <TopContributorsTable
            contributors={topContributors}
            financialYear={topContributorsFY || currentIndianFY()}
            onViewAll={() =>
              navigate(
                `/contributors?financial_year=${encodeURIComponent(
                  topContributorsFY || currentIndianFY()
                )}`
              )
            }
          />
        )}
      </div>

      {/* Contribution form modal — reuses existing form */}
      <Modal
  isOpen={formOpen}
  onClose={() => setFormOpen(false)}
  title={t('alumni_contribute_title')}
>
  {/* key={formOpen} forces a fresh remount every time the modal opens,
      guaranteeing no stale state survives a previous submission. */}
  <AlumniContribute
    key={formOpen ? 'open' : 'closed'}
    embedded
    onSubmitted={() => {
      setFormOpen(false);
      onFormSubmitted();   // parent refreshes My Contributions
    }}
  />
</Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — SPONSORS (make / my / other alumni)
// ─────────────────────────────────────────────────────────────────────────────
const SponsorsPage: React.FC<{
  onFormSubmitted: () => void;
  mineKey: number;
  othersKey: number;
}> = ({ onFormSubmitted, mineKey, othersKey }) => {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. MAKE A SPONSOR CTA */}
      <div className="bg-gradient-to-r from-[#FFFDF5] via-white to-[#FFFDF5] border border-[#F4C542]/40 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3 min-w-0">
          <div className="w-11 h-11 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center shrink-0">
            <HandHeart className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-[#111111]">
              {t('alumni_support_cta_make_sponsor')}
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              {t('alumni_support_make_sponsor_subtitle')}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto shrink-0 shadow-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t('alumni_support_cta_make_sponsor')}
        </Button>
      </div>

      {/* 2. MY SPONSORS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#111111]">
              {t('alumni_my_sponsors_title')}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {t('alumni_my_sponsors_subtitle')}
            </p>
          </div>
        </div>
        <AlumniSponsors key={`mine-${mineKey}`} mine />
      </div>

      {/* 3. OTHER ALUMNI SPONSORS */}
      <div>
        <div className="mb-3">
            <h3 className="text-base font-extrabold text-[#111111]"></h3>
        </div>
        <AlumniSponsors key={`other-${othersKey}`} />
      </div>

      {/* Sponsor form modal — reuses existing sponsor form */}
      <Modal
  isOpen={formOpen}
  onClose={() => setFormOpen(false)}
  title={t('alumni_sponsors_add')}
>
  <AlumniSponsors
    key={formOpen ? 'open' : 'closed'}
    mine
    formOnly
    onSubmitted={() => {
      setFormOpen(false);
      onFormSubmitted();
    }}
  />
</Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PARENT MODULE — Support Our School (hero + tabs + ONE active child page)
// ─────────────────────────────────────────────────────────────────────────────
export const AlumniSupportSchool: React.FC = () => {
  const { t } = useLanguage();

  // Default child page = MY ACTIVITIES
  const [activeTab, setActiveTab] = useState<SupportTab>('activities');

  // Refresh keys so child pages re-fetch after a submission
  const [myContribKey, setMyContribKey] = useState(0);
  const [mySponsorsKey, setMySponsorsKey] = useState(0);
  const [othersSponsorsKey, setOthersSponsorsKey] = useState(0);

  const handleContributionSubmitted = useCallback(() => {
    setMyContribKey((k) => k + 1);
    // (Top Contributors inside ContributionPage refetches automatically on remount
    //  when the user switches tabs; no extra logic needed here.)
  }, []);

  const handleSponsorSubmitted = useCallback(() => {
    setMySponsorsKey((k) => k + 1);
    setOthersSponsorsKey((k) => k + 1);
  }, []);

  const tabs: { id: SupportTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'activities',
      label: t('alumni_support_section_my_activities'),
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'contribution',
      label: t('alumni_support_section_contribution'),
      icon: <HandCoins className="w-4 h-4" />,
    },
    {
      id: 'sponsors',
      label: t('alumni_support_section_sponsors'),
      icon: <HandHeart className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* ── SUPPORT OUR SCHOOL HERO (persistent across all 3 child pages) ── */}
      <section aria-labelledby="support-school-heading">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#2D2D2D] p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-[#F4C542]/15 border border-[#F4C542]/40 rounded-full px-3 py-1 mb-3">
              <HeartHandshake className="w-3.5 h-3.5 text-[#F4C542]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F4C542]">
                {t('alumni_section_support')}
              </span>
            </div>
            <h1
              id="support-school-heading"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            >
              {t('alumni_support_page_title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed max-w-2xl">
              {t('alumni_support_page_subtitle')}
            </p>

            {/* Internal page navigation — exactly THREE tabs */}
            <div className="mt-5 flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={active ? 'page' : undefined}
                    className={
                      'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ' +
                      (active
                        ? 'bg-[#F4C542] text-[#111111] shadow-md'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white')
                    }
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-[#F4C542]/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ── CHILD PAGE CONTENT — ONLY ONE rendered at a time ── */}
      <section>
        {activeTab === 'activities' && <MyActivitiesPage key={myContribKey + mySponsorsKey} />}

        {activeTab === 'contribution' && (
          <ContributionPage
            myContribKey={myContribKey}
            onFormSubmitted={handleContributionSubmitted}
          />
        )}

        {activeTab === 'sponsors' && (
          <SponsorsPage
            mineKey={mySponsorsKey}
            othersKey={othersSponsorsKey}
            onFormSubmitted={handleSponsorSubmitted}
          />
        )}
      </section>
    </div>
  );
};