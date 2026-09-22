import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import type { AuditStatementListSummary, TopContributor, Sponsor } from '../../../types';
import { AuditHero } from './components/AuditHero';
import { AuditStatementRow } from './components/AuditStatementRow';
import { WhyWePublishCard } from './components/WhyWePublishCard';
import { TopContributorsTable } from './components/TopContributorsTable';
import { SponsorsGrid } from './components/SponsorsGrid';
import { MeetingMinutesSection } from './components/MeetingMinutesSection';
import { LoadingState, EmptyState } from '../../../components/EmptyState';

/**
 * Compute the current Indian financial year string, e.g. "2025 - 2026".
 * Indian FY: 1 April → 31 March.
 */
const currentIndianFY = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-12
  return m >= 4 ? `${y} - ${y + 1}` : `${y - 1} - ${y}`;
};

export const AuditListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ---- Independent state per module --------------------------------------
  // 1. Audits
  const [statements, setStatements] = useState<AuditStatementListSummary[]>([]);
  const [statementsLoading, setStatementsLoading] = useState(true);

  // 2. Contributors
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [contributorsLoading, setContributorsLoading] = useState(true);

  // 3. Sponsors
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  // Each public section follows its own financial-year rule.
  const [contributorsFY, setContributorsFY] = useState<string>('');
  const [sponsorsFY, setSponsorsFY] = useState<string>(currentIndianFY());

  // ---- 1. Load published audit statements (independent) ------------------
  useEffect(() => {
    let mounted = true;
    setStatementsLoading(true);
    api.getPublicAuditStatements()
      .then((data) => { if (mounted) setStatements(data || []); })
      .catch((err) => console.error('[AuditListPage] statements fetch failed:', err))
      .finally(() => { if (mounted) setStatementsLoading(false); });
    return () => { mounted = false; };
  }, []);

  // ---- 2. Resolve the contributor FY independently of audits --------------
  //   Use the latest completed, public contribution FY; fall back to the current FY.
  useEffect(() => {
    let mounted = true;
    api.getPublicLatestContributionFY()
      .then((res) => {
        if (!mounted) return;
        setContributorsFY(res?.financial_year || currentIndianFY());
      })
      .catch(() => {
        if (!mounted) return;
        setContributorsFY(currentIndianFY());
      });
    return () => { mounted = false; };
  }, []);

  // ---- 3. Load contributors using only contribution data ------------------
  useEffect(() => {
    if (!contributorsFY) return;
    let mounted = true;
    setContributorsLoading(true);
    api.getPublicTopContributors(contributorsFY, 1000)
      .then((data) => { if (mounted) setContributors(data || []); })
      .catch((err) => {
        console.error('[AuditListPage] contributors fetch failed:', err);
        if (mounted) setContributors([]);
      })
      .finally(() => { if (mounted) setContributorsLoading(false); });
    return () => { mounted = false; };
  }, [contributorsFY]);

  // ---- 4. Load sponsors using the sponsor module's current-FY rule ---------
  useEffect(() => {
    let mounted = true;
    setSponsorsLoading(true);
    api.getPublicSponsors(sponsorsFY)
      .then((data) => { if (mounted) setSponsors(data || []); })
      .catch((err) => {
        console.error('[AuditListPage] sponsors fetch failed:', err);
        if (mounted) setSponsors([]);
      })
      .finally(() => { if (mounted) setSponsorsLoading(false); });
    return () => { mounted = false; };
  }, [sponsorsFY]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fadeIn">
        <AuditHero />

        {/* SECTION 1 — Audit Statements + Why We Publish (unchanged layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#854D0E]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                {t('audit_statements_title')}
              </h2>
            </div>

            {statementsLoading ? (
              <LoadingState />
            ) : statements.length === 0 ? (
              <EmptyState
                title={t('audit_no_statements')}
                description={t('audit_no_statements_desc')}
              />
            ) : (
              <div className="space-y-3">
                {statements.map((s) => (
                  <AuditStatementRow
                    key={s.id}
                    statement={s}
                    onReadMore={() => navigate(`/audit/${s.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <WhyWePublishCard />
          </div>
        </div>

        {/* SECTION 2 — Top Contributors + Our Sponsors (independent of audits) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="min-w-0">
            {contributorsLoading ? (
              <LoadingState />
            ) : (
              <TopContributorsTable
                contributors={contributors}
                financialYear={contributorsFY || currentIndianFY()}
                onViewAll={() => navigate(`/contributors?financial_year=${encodeURIComponent(contributorsFY || currentIndianFY())}`)}
              />
            )}
          </div>

          <div className="min-w-0">
            {sponsorsLoading ? (
              <LoadingState />
            ) : (
              <SponsorsGrid
                sponsors={sponsors}
                financialYear={sponsorsFY}
                onViewAll={() => navigate(`/sponsors?financial_year=${encodeURIComponent(sponsorsFY)}`)}
              />
            )}
          </div>
        </div>
        {/* SECTION 3 — Meeting Minutes */}
        <div className="grid grid-cols-1 gap-6">
          
          <MeetingMinutesSection />
        </div>
      </div>
    </div>
  );
}
 