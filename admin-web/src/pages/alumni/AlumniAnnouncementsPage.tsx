import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  FileText,
  Award,
  HandHeart,
  Download,
  ExternalLink,
  Search,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  DollarSign,
  Info,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { Modal } from '../../components/Modal';
import { LoadingState } from '../../components/EmptyState';
import type {
  Announcement,
  AuditStatementListSummary,
  AuditStatementDetail,
  TopContributor,
  Sponsor,
} from '../../types';

type TabType = 'ANNOUNCEMENTS' | 'AUDIT' | 'CONTRIBUTIONS' | 'SPONSORS';

/** Compute current Indian financial year string (e.g. "2025 - 2026") */
const currentIndianFY = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 4 ? `${y} - ${y + 1}` : `${y - 1} - ${y}`;
};

/** Format numbers to INR currency string */
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const AlumniAnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Selected tab
  const [activeTab, setActiveTab] = useState<TabType>('ANNOUNCEMENTS');

  // Shared financial year filter for financial tabs
  const [financialYear, setFinancialYear] = useState<string>('');

  // Search queries
  const [announcementSearch, setAnnouncementSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [contributorSearch, setContributorSearch] = useState('');
  const [sponsorSearch, setSponsorSearch] = useState('');

  // Modals state
  const [selectedAuditSummary, setSelectedAuditSummary] = useState<AuditStatementListSummary | null>(null);
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<AuditStatementDetail | null>(null);
  const [loadingAuditDetail, setLoadingAuditDetail] = useState(false);

  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  // Data states & loading
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const [auditStatements, setAuditStatements] = useState<AuditStatementListSummary[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);

  // 1. Fetch Announcements
  useEffect(() => {
    let isMounted = true;
    setLoadingAnnouncements(true);
    api.getAnnouncements()
      .then(res => { if (isMounted) setAnnouncements(res || []); })
      .catch(console.error)
      .finally(() => { if (isMounted) setLoadingAnnouncements(false); });
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Audit Statements
  useEffect(() => {
    let isMounted = true;
    setLoadingAudit(true);
    api.getPublicAuditStatements()
      .then(res => { if (isMounted) setAuditStatements(res || []); })
      .catch(console.error)
      .finally(() => { if (isMounted) setLoadingAudit(false); });
    return () => { isMounted = false; };
  }, []);

  // 3. Fetch Top Contributors
  useEffect(() => {
    let isMounted = true;
    setLoadingContributors(true);
    api.getPublicTopContributors(financialYear, 100)
      .then(res => { if (isMounted) setContributors(res || []); })
      .catch(console.error)
      .finally(() => { if (isMounted) setLoadingContributors(false); });
    return () => { isMounted = false; };
  }, [financialYear]);

  // 4. Fetch Sponsors
  useEffect(() => {
    let isMounted = true;
    setLoadingSponsors(true);
    api.getPublicSponsors(financialYear)
      .then(res => { if (isMounted) setSponsors(res || []); })
      .catch(console.error)
      .finally(() => { if (isMounted) setLoadingSponsors(false); });
    return () => { isMounted = false; };
  }, [financialYear]);

  // Open Audit detail modal & load full detail (including pdf_url)
  const handleOpenAuditDetail = async (summary: AuditStatementListSummary) => {
    setSelectedAuditSummary(summary);
    setSelectedAuditDetail(null);
    setLoadingAuditDetail(true);
    try {
      const detail = await api.getPublicAuditStatementDetail(summary.id);
      setSelectedAuditDetail(detail);
    } catch (err) {
      console.error('Failed to load audit statement detail:', err);
      // Fallback summary object
      setSelectedAuditDetail({
        ...summary,
        is_published: true,
        display_order: 1,
        status: 'ACTIVE',
      });
    } finally {
      setLoadingAuditDetail(false);
    }
  };

  const handleCloseAuditModal = () => {
    setSelectedAuditSummary(null);
    setSelectedAuditDetail(null);
    setLoadingAuditDetail(false);
  };

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    if (!announcementSearch.trim()) return announcements;
    const q = announcementSearch.toLowerCase();
    return announcements.filter(
      a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [announcements, announcementSearch]);

  // Filtered audits
  const filteredAudits = useMemo(() => {
    let list = auditStatements;
    if (financialYear) {
      list = list.filter(a => !a.financial_year || a.financial_year === financialYear);
    }
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [auditStatements, financialYear, auditSearch]);

  // Filtered contributors
  const filteredContributors = useMemo(() => {
    if (!contributorSearch.trim()) return contributors;
    const q = contributorSearch.toLowerCase();
    return contributors.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.name_ta && c.name_ta.toLowerCase().includes(q)) ||
        (c.batch && String(c.batch).includes(q))
    );
  }, [contributors, contributorSearch]);

  // Total contribution calculation
  const totalContributionsAmount = useMemo(() => {
    return contributors.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [contributors]);

  // Filtered sponsors
  const filteredSponsors = useMemo(() => {
    if (!sponsorSearch.trim()) return sponsors;
    const q = sponsorSearch.toLowerCase();
    return sponsors.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        (s.name_ta && s.name_ta.toLowerCase().includes(q)) ||
        (s.sponsored_item && s.sponsored_item.toLowerCase().includes(q))
    );
  }, [sponsors, sponsorSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-[#111111] p-1 sm:p-2 animate-fadeIn">
      {/* Header & Title Banner */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1F2937] to-[#111111] p-5 sm:p-7 rounded-2xl sm:rounded-3xl text-white shadow-md relative overflow-hidden border border-gray-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'ta'
                  ? 'அதிகாரப்பூர்வ தகவல்கள் & நிதி வெளிப்படைத்தன்மை'
                  : 'Official Updates & Financial Transparency'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {language === 'ta'
                ? 'அறிவிப்புகள், ஆடிட் & நிதி அறிக்கைகள்'
                : 'Announcements, Audit & Financial Reports'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              {language === 'ta'
                ? 'பள்ளி அறிவிப்புகள், தணிக்கை அறிக்கைகள், முன்னாள் மாணவர்களின் பங்களிப்புகள் மற்றும் ஆதரவாளர்களின் முழுமையான விவரங்கள்.'
                : 'Stay updated with official school notices, verified statutory audit reports, alumni contributions, and sponsor details.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => navigate('/alumni/support')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'ta' ? 'பங்களிப்பு செய்ய' : 'Make Contribution'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-nowrap overflow-x-auto gap-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/50 shadow-xs'
              : 'text-[#4B5563] hover:bg-[#FAFAFA] hover:text-[#111111]'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>{language === 'ta' ? 'அறிவிப்புகள் & செய்திகள்' : 'Announcements & Notices'}</span>
          {announcements.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 ml-1">
              {announcements.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/50 shadow-xs'
              : 'text-[#4B5563] hover:bg-[#FAFAFA] hover:text-[#111111]'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>{language === 'ta' ? 'ஆடிட் & நிதி அறிக்கைகள்' : 'Audit & Financial Statements'}</span>
          {auditStatements.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 ml-1">
              {auditStatements.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CONTRIBUTIONS')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'CONTRIBUTIONS'
              ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/50 shadow-xs'
              : 'text-[#4B5563] hover:bg-[#FAFAFA] hover:text-[#111111]'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>{language === 'ta' ? 'முன்னாள் மாணவர்கள் பங்களிப்புகள்' : 'Alumni Contributions'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SPONSORS')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'SPONSORS'
              ? 'bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/50 shadow-xs'
              : 'text-[#4B5563] hover:bg-[#FAFAFA] hover:text-[#111111]'
          }`}
        >
          <HandHeart className="w-4 h-4 shrink-0" />
          <span>{language === 'ta' ? 'ஆதரவாளர்கள் & பங்காளிகள்' : 'Sponsors & Partners'}</span>
          {sponsors.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 ml-1">
              {sponsors.length}
            </span>
          )}
        </button>
      </div>



      {/* =========================================================================
       * TAB 1: ANNOUNCEMENTS & NOTICES
       * ========================================================================= */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                {language === 'ta' ? 'பள்ளி அறிவிப்புகள் & செய்திகள்' : 'School Announcements & Updates'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {language === 'ta'
                  ? 'பள்ளி நிர்வாகம் மற்றும் அலுமினி சங்கத்தின் அதிகாரப்பூர்வ அறிவிப்புகள்'
                  : 'Official notices, events, and circulars from school administration'}
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={announcementSearch}
                onChange={e => setAnnouncementSearch(e.target.value)}
                placeholder={language === 'ta' ? 'தேடுக...' : 'Search announcements...'}
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {loadingAnnouncements ? (
            <LoadingState />
          ) : filteredAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAnnouncements.map(ann => (
                <div
                  key={ann.id}
                  className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-amber-300 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3">
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 tracking-wide uppercase">
                      {ann.target || (language === 'ta' ? 'பள்ளி அறிவிப்பு' : 'SCHOOL ANNOUNCEMENT')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDateDDMMYYYY(ann.created_at)}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-[#111111] leading-snug">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-[#6B7280]">
                {language === 'ta'
                  ? 'அறிவிப்புகள் எதுவும் கிடைக்கவில்லை.'
                  : 'No official announcements found.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       * TAB 2: AUDIT & FINANCIAL STATEMENTS
       * ========================================================================= */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          {/* Audit Metrics KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B7280]">
                  {language === 'ta' ? 'மொத்த ஆடிட் அறிக்கைகள்' : 'Total Audited Statements'}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                  {auditStatements.length}
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B7280]">
                  {language === 'ta' ? 'சட்டரீதியான தணிக்கை' : 'Statutory Compliance'}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                  100% {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B7280]">
                  {language === 'ta' ? 'நிதி அறிக்கைகள்' : 'Financial Transparency'}
                </p>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#111111]">
                  {financialYear || (language === 'ta' ? 'அனைத்து அறிக்கைகள்' : 'All Reports')}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Audit Statements Table / Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB]">
                <h3 className="font-extrabold text-base text-[#111111] flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#854D0E]" />
                  <span>
                    {language === 'ta'
                      ? `ஆடிட் அறிக்கைகள்${financialYear ? ` (${financialYear})` : ''}`
                      : `Audited Financial Reports${financialYear ? ` (${financialYear})` : ''}`}
                  </span>
                </h3>

                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    placeholder={language === 'ta' ? 'தேடுக...' : 'Filter audit statements...'}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {loadingAudit ? (
                <LoadingState />
              ) : filteredAudits.length > 0 ? (
                <div className="space-y-3">
                  {filteredAudits.map(s => (
                    <div
                      key={s.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                            FY {s.financial_year}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDateDDMMYYYY(s.period_start)} to {formatDateDDMMYYYY(s.period_end)}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-[#111111] truncate">
                          {language === 'ta' && s.title_ta ? s.title_ta : s.title}
                        </h4>

                        {s.description && (
                          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                            {language === 'ta' && s.description_ta ? s.description_ta : s.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => handleOpenAuditDetail(s)}
                          className="px-4 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{language === 'ta' ? 'அறிக்கையைப் பார்' : 'View PDF Report'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">
                    {language === 'ta'
                      ? 'இந்த நிதி ஆண்டுக்கான தணிக்கை அறிக்கைகள் எதுவும் வெளியிடப்படவில்லை.'
                      : 'No audit statements published for this financial year.'}
                  </p>
                </div>
              )}
            </div>

            {/* Side Card: Why We Publish */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-[#FFFDF2] to-[#FFF7D6] p-5 sm:p-6 rounded-2xl border border-[#F4C542]/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-amber-200 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-900" />
                  </div>
                  <h3 className="font-bold text-base text-[#111111]">
                    {language === 'ta' ? 'வெளிப்படைத்தன்மை & நம்பிக்கை' : 'Financial Transparency & Trust'}
                  </h3>
                </div>

                <p className="text-xs text-[#374151] leading-relaxed">
                  {language === 'ta'
                    ? 'முன்னாள் மாணவர்கள் சங்கத்தின் அனைத்து நிதி வரவுகளும், செலவினங்களும் தணிக்கையாளரால் சரிபார்க்கப்பட்டு சட்டப்பூர்வமாக வெளியிடப்படுகின்றன.'
                    : 'Our alumni association and school trust strictly maintain 100% financial transparency. Audited balance sheets and statutory financial statements are open for member verification.'}
                </p>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'ta' ? 'பட்டயக் கணக்காளர் சான்றளித்தது' : 'Chartered Accountant Certified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'ta' ? 'பொது பார்வைக்கு லபியம்' : 'Public & Alumni Accessible'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'ta' ? 'வருடாந்திர தணிக்கை அறிக்கை' : 'Annual Statutory Compliance'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 3: ALUMNI CONTRIBUTIONS
       * ========================================================================= */}
      {activeTab === 'CONTRIBUTIONS' && (
        <div className="space-y-6">
          {/* Top Banner & Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B7280]">
                  {language === 'ta' ? 'மொத்த பங்களிப்பு நிதி' : 'Total Contributions (FY)'}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#854D0E]">
                  {formatINR(totalContributionsAmount)}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#6B7280]">
                  {language === 'ta' ? 'பங்களித்த உறுப்பினர்கள்' : 'Alumni Donors'}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                  {contributors.length}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#6B7280]">
                  {language === 'ta' ? 'பள்ளி மேம்பாட்டு நிதி' : 'Support School Project'}
                </p>
                <button
                  onClick={() => navigate('/alumni/support')}
                  className="mt-1 font-bold text-xs text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'ta' ? 'இப்போதே பங்களிக்கவும்' : 'Contribute Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contributors Table Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-base text-[#111111] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#854D0E]" />
                <span>
                  {language === 'ta'
                    ? `முன்னாள் மாணவர்கள் பங்களிப்பாளர்கள் பட்டியல்${financialYear ? ` (${financialYear})` : ''}`
                    : `Alumni Top Contributors Leaderboard${financialYear ? ` (${financialYear})` : ''}`}
                </span>
              </h3>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={contributorSearch}
                  onChange={e => setContributorSearch(e.target.value)}
                  placeholder={language === 'ta' ? 'பெயர் / பேட்ச் தேடுக...' : 'Search contributor or batch...'}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            {loadingContributors ? (
              <LoadingState />
            ) : filteredContributors.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                      <th className="px-4 py-3 w-16">#</th>
                      <th className="px-4 py-3">{language === 'ta' ? 'பெயர்' : 'Alumni Name'}</th>
                      <th className="px-4 py-3">{language === 'ta' ? 'பேட்ச்' : 'Batch Year'}</th>
                      <th className="px-4 py-3 text-right">{language === 'ta' ? 'தொகை' : 'Contribution Amount'}</th>
                      <th className="px-4 py-3 text-right">{language === 'ta' ? 'தேதி' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {filteredContributors.map((c, idx) => (
                      <tr key={c.id || idx} className="hover:bg-[#FFFDF2] transition-colors">
                        <td className="px-4 py-3.5 font-extrabold text-[#6B7280]">{idx + 1}</td>
                        <td className="px-4 py-3.5 font-bold text-[#111111]">
                          {language === 'ta' && c.name_ta ? c.name_ta : c.name}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-[#4B5563]">
                          {c.batch ? `${c.batch} Batch` : '—'}
                        </td>
                        <td className="px-4 py-3.5 font-extrabold text-right text-[#854D0E]">
                          {formatINR(c.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[#6B7280]">
                          {formatDateDDMMYYYY(c.contribution_date, '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-[#6B7280]">
                {language === 'ta'
                  ? 'இந்த நிதி ஆண்டில் பங்களிப்பு பதிவுகள் எதுவும் இல்லை.'
                  : 'No contribution records found for this financial year.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
       * TAB 4: SPONSORS & PARTNERS
       * ========================================================================= */}
      {activeTab === 'SPONSORS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB]">
            <div>
              <h3 className="font-extrabold text-base text-[#111111] flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-[#854D0E]" />
                <span>
                  {language === 'ta'
                    ? `ஆதரவாளர்கள் & நிறுவன பங்காளிகள்${financialYear ? ` (${financialYear})` : ''}`
                    : `Sponsors & Corporate Partners${financialYear ? ` (${financialYear})` : ''}`}
                </span>
              </h3>
              <p className="text-xs text-[#6B7280]">
                {language === 'ta'
                  ? 'பள்ளி உள்கட்டமைப்பு மற்றும் முன்னாள் மாணவர் திட்டங்களுக்கு ஆதரவளிக்கும் நிறுவனங்கள்.'
                  : 'Recognizing alumni businesses and corporate sponsors supporting school programs.'}
              </p>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={sponsorSearch}
                onChange={e => setSponsorSearch(e.target.value)}
                placeholder={language === 'ta' ? 'ஆதரவாளர் தேடுக...' : 'Search sponsors...'}
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {loadingSponsors ? (
            <LoadingState />
          ) : filteredSponsors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSponsors.map(sponsor => {
                const displayName = language === 'ta' && sponsor.name_ta ? sponsor.name_ta : sponsor.name;
                return (
                  <div
                    key={sponsor.id}
                    className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-14 h-14 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center p-2 shrink-0">
                          {sponsor.logo_url ? (
                            <img
                              src={sponsor.logo_url}
                              alt={sponsor.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-[#854D0E] font-extrabold text-xl">
                              {sponsor.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        {sponsor.sponsor_tier && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                            {sponsor.sponsor_tier}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base text-[#111111]">{displayName}</h4>
                        {sponsor.sponsored_item && (
                          <p className="text-xs font-semibold text-[#854D0E] mt-0.5">
                            {sponsor.sponsored_item}
                          </p>
                        )}
                      </div>

                      {sponsor.description && (
                        <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed">
                          {sponsor.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
                      {sponsor.amount ? (
                        <span className="font-extrabold text-[#854D0E]">
                          {formatINR(sponsor.amount)}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">Patron Partner</span>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedSponsor(sponsor)}
                        className="font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
                      >
                        {language === 'ta' ? 'விவரம் பார்க்க →' : 'View Details →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#E5E7EB]">
              <HandHeart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-[#6B7280]">
                {language === 'ta'
                  ? 'இந்த நிதி ஆண்டிற்கான ஆதரவாளர்கள் தகவல்கள் இல்லை.'
                  : 'No sponsor records found for this financial year.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       * MODAL: AUDIT STATEMENT DETAIL + PDF VIEWER
       * ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedAuditSummary)}
        onClose={handleCloseAuditModal}
        title={language === 'ta' ? 'ஆடிட் & நிதி அறிக்கை' : 'Audited Financial Statement'}
        maxWidth="max-w-4xl"
      >
        {selectedAuditSummary && (
          <div className="space-y-5">
            {/* Header / Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    FY {selectedAuditSummary.financial_year}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatDateDDMMYYYY(selectedAuditSummary.period_start)} to {formatDateDDMMYYYY(selectedAuditSummary.period_end)}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-[#111111]">
                  {language === 'ta' && selectedAuditSummary.title_ta ? selectedAuditSummary.title_ta : selectedAuditSummary.title}
                </h4>
              </div>

              {selectedAuditDetail?.pdf_url && (
                <a
                  href={selectedAuditDetail.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={selectedAuditDetail.pdf_file_name || 'audit-statement.pdf'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'ta' ? 'PDF அறிக்கையை பதிவிறக்கு' : 'Download PDF Report'}</span>
                </a>
              )}
            </div>

            {loadingAuditDetail ? (
              <LoadingState />
            ) : (
              <div className="space-y-4">
                {selectedAuditDetail?.description && (
                  <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-xs font-bold text-[#6B7280] block mb-1">
                      {language === 'ta' ? 'அறிக்கை விவரம்:' : 'Statement Description:'}
                    </span>
                    <p className="text-xs sm:text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                      {language === 'ta' && selectedAuditDetail.description_ta ? selectedAuditDetail.description_ta : selectedAuditDetail.description}
                    </p>
                  </div>
                )}

                {/* PDF Viewer Container */}
                {selectedAuditDetail?.pdf_url ? (
                  <div className="bg-[#111111] rounded-2xl overflow-hidden border border-[#374151] shadow-lg">
                    <div className="flex items-center justify-between px-3 py-2 bg-[#1F2937] border-b border-[#374151]">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                        <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                        <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider truncate max-w-xs">
                        {selectedAuditDetail.pdf_file_name || 'Audited Financial Report PDF'}
                      </span>
                    </div>
                    <iframe
                      src={`${selectedAuditDetail.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                      title="Audited Statement PDF"
                      className="w-full bg-[#374151]"
                      style={{ height: 'min(60vh, 520px)' }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E7EB]">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                      {language === 'ta'
                        ? 'இந்த தணிக்கை அறிக்கைக்கு PDF கோப்பு எதுவும் இணைக்கப்படவில்லை.'
                        : 'No PDF file attached to this audit statement record.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* =========================================================================
       * MODAL: SPONSOR DETAIL
       * ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedSponsor)}
        onClose={() => setSelectedSponsor(null)}
        title={language === 'ta' ? 'ஆதரவாளர் விவரம்' : 'Sponsor Details'}
      >
        {selectedSponsor && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 border-b border-[#E5E7EB] pb-4">
              <div className="w-16 h-16 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center p-2 shrink-0">
                {selectedSponsor.logo_url ? (
                  <img src={selectedSponsor.logo_url} alt={selectedSponsor.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[#854D0E] font-extrabold text-2xl">{selectedSponsor.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-[#111111]">{selectedSponsor.name}</h4>
                {selectedSponsor.name_ta && <p className="text-xs text-[#6B7280]">{selectedSponsor.name_ta}</p>}
                {selectedSponsor.sponsor_tier && (
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    {selectedSponsor.sponsor_tier} SPONSOR
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAFA] p-3 rounded-xl border border-[#E5E7EB]">
              <div>
                <span className="font-semibold text-[#6B7280] block">{language === 'ta' ? 'நிதி ஆண்டு' : 'Financial Year'}</span>
                <span className="font-bold text-[#111111]">{selectedSponsor.financial_year}</span>
              </div>
              <div>
                <span className="font-semibold text-[#6B7280] block">{language === 'ta' ? 'ஆதரவளித்த தொகை' : 'Budget / Amount'}</span>
                <span className="font-extrabold text-[#854D0E]">
                  {selectedSponsor.amount ? formatINR(selectedSponsor.amount) : 'N/A'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-[#6B7280] block">{language === 'ta' ? 'ஆதரவளித்த திட்டம் / பொருள்' : 'Sponsored Project / Item'}</span>
                <span className="font-bold text-[#111111]">{selectedSponsor.sponsored_item || 'N/A'}</span>
              </div>
            </div>

            {selectedSponsor.description && (
              <div>
                <span className="font-bold text-[#6B7280] text-xs block mb-1">
                  {language === 'ta' ? 'விளக்கம்' : 'Description'}
                </span>
                <p className="text-xs sm:text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                  {selectedSponsor.description}
                </p>
              </div>
            )}

            {selectedSponsor.website_url && (
              <a
                href={selectedSponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>{language === 'ta' ? 'இணையதளத்தைப் பார்வையிட' : 'Visit Official Website'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
