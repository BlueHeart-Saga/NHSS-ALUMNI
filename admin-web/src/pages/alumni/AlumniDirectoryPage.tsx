import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, Filter, Building2, MapPin, User, UserPlus, X, Mail, ExternalLink, RotateCcw, Loader2,
  Droplet, HandHeart, Heart, Users, GraduationCap, ShieldCheck, Clock, AlertCircle,
  ChevronLeft, ChevronRight, RefreshCw, Layers, Calendar, Briefcase, CheckCircle2, XCircle, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import { api } from '../../services/api';
import { AlumniProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import { AlumniContextType } from '../../layouts/AlumniLayout';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { StatsGridSkeleton } from '../../components/EmptyState';
import { getConnectionsStore, sendConnectionRequest, ConnectionItem } from '../../utils/connectionStorage';
import { AlumniDetailModal } from '../../components/AlumniDetailModal';

export const AlumniDirectoryPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useOutletContext<AlumniContextType>();
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [availableBatches, setAvailableBatches] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'batch_summary'>('cards');

  // Connection Store State
  const [connections, setConnections] = useState<ConnectionItem[]>(getConnectionsStore());

  useEffect(() => {
    const reload = () => setConnections(getConnectionsStore());
    window.addEventListener('connections_updated', reload);
    return () => window.removeEventListener('connections_updated', reload);
  }, []);

  const getConnectionStatus = (alumnusId: string) => {
    const item = connections.find(c => c.id === alumnusId);
    if (!item) return 'NONE';
    return item.status;
  };

  const isOwnAccount = (alumnus: AlumniProfile) => {
    if (!user) return false;
    if (alumnus.id && user.id && alumnus.id === user.id) return true;
    if (alumnus.mobile && user.mobile && alumnus.mobile === user.mobile) return true;
    if (alumnus.email && user.email && alumnus.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (alumnus.full_name && user.full_name && alumnus.full_name.toLowerCase() === user.full_name.toLowerCase()) return true;
    return false;
  };

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [professionFilter, setProfessionFilter] = useState<string>('ALL');
  const [bloodFilter, setBloodFilter] = useState<string>('ALL');
  const [volunteerFilter, setVolunteerFilter] = useState<string>('ALL');
  const [donationFilter, setDonationFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name' | 'batch_desc' | 'batch_asc'>('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [connectModalAlumni, setConnectModalAlumni] = useState<AlumniProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState<string>('');

  const fetchDirectoryData = async () => {
    try {
      setLoading(true);
      const [dirData, batchData] = await Promise.all([
        api.getDirectory('', undefined, 'ALL').catch(() =>
          api.searchAlumni('', undefined, 'ALL').catch(() => api.getAlumniDirectory())
        ),
        api.getPublicBatches().catch(() => [])
      ]);

      const records: AlumniProfile[] = dirData || [];
      setAlumniList(records);

      const currentYear = new Date().getFullYear();
      const defaultSchoolYears = Array.from({ length: currentYear - 1962 + 1 }, (_, i) => currentYear - i);
      const batchYearsFromApi = (batchData || []).map((b: any) => b.passing_year).filter(Boolean);
      const batchYearsFromAlumni = records.map((a: any) => a.passing_year).filter(Boolean);

      const combinedYears = Array.from(new Set([...defaultSchoolYears, ...batchYearsFromApi, ...batchYearsFromAlumni]))
        .sort((a, b) => b - a);

      setAvailableBatches(combinedYears);
    } catch (err) {
      console.error('Failed to load alumni directory data:', err);
      setAlumniList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, batchFilter, cityFilter, professionFilter, bloodFilter, volunteerFilter, donationFilter, verificationFilter, sortBy]);

  // Batch Distribution Counts
  const batchCountsMap = useMemo(() => {
    const map = new Map<number, number>();
    alumniList.forEach((a) => {
      if (a.passing_year) {
        map.set(a.passing_year, (map.get(a.passing_year) || 0) + 1);
      }
    });
    return map;
  }, [alumniList]);

  // Unique Lists for Dropdowns
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(alumniList.map(a => a.current_city || (a as any).city).filter((c): c is string => Boolean(c)))).sort();
  }, [alumniList]);

  const uniqueProfessions = useMemo(() => {
    return Array.from(new Set(alumniList.map(a => a.profession || (a as any).designation || (a as any).position).filter((p): p is string => Boolean(p)))).sort();
  }, [alumniList]);

  const resetFilters = () => {
    setSearch('');
    setBatchFilter('ALL');
    setCityFilter('ALL');
    setProfessionFilter('ALL');
    setBloodFilter('ALL');
    setVolunteerFilter('ALL');
    setDonationFilter('ALL');
    setVerificationFilter('ALL');
    setSortBy('date_desc');
  };

  const hasActiveFilters = Boolean(
    search || batchFilter !== 'ALL' || cityFilter !== 'ALL' || professionFilter !== 'ALL' ||
    bloodFilter !== 'ALL' || volunteerFilter !== 'ALL' || donationFilter !== 'ALL' || verificationFilter !== 'ALL'
  );

  // Filtering Logic
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((a) => {
      // Respect directory_visible privacy flag (if false and not own profile, hide from directory listing)
      if (a.directory_visible === false && !isOwnAccount(a)) {
        return false;
      }

      // Show verified / approved alumni only
      const verStatus = (a.verification_status || 'APPROVED').toUpperCase();
      if (verStatus !== 'APPROVED' && verStatus !== 'VERIFIED') {
        return false;
      }

      const q = search.toLowerCase().trim();
      const name = (a.full_name || (a as any).name || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      const prof = (a.profession || (a as any).designation || (a as any).position || '').toLowerCase();
      const comp = (a.company || (a as any).company_name || '').toLowerCase();
      const city = (a.current_city || (a as any).city || '').toLowerCase();
      const rollNo = (a.roll_no || '').toLowerCase();
      const sec = (a.section || '').toLowerCase();

      const matchSearch = search === '' ||
        name.includes(q) ||
        email.includes(q) ||
        prof.includes(q) ||
        comp.includes(q) ||
        city.includes(q) ||
        rollNo.includes(q) ||
        sec.includes(q) ||
        String(a.passing_year || '').includes(q);

      const matchBatch = batchFilter === 'ALL' || String(a.passing_year) === batchFilter;
      const matchCity = cityFilter === 'ALL' || (city && city.includes(cityFilter.toLowerCase()));
      const matchProf = professionFilter === 'ALL' || (prof && prof.includes(professionFilter.toLowerCase()));
      const matchBlood = bloodFilter === 'ALL' || (a.blood_group && a.blood_group.toUpperCase() === bloodFilter.toUpperCase());
      const matchVol = volunteerFilter === 'ALL' || (volunteerFilter === 'YES' ? a.is_volunteer === 'YES' : a.is_volunteer !== 'YES');
      const matchDon = donationFilter === 'ALL' || (donationFilter === 'YES' ? a.willing_to_donate === 'YES' : a.willing_to_donate !== 'YES');
      const matchVer = verificationFilter === 'ALL' || ((a.verification_status || 'APPROVED').toUpperCase() === verificationFilter.toUpperCase());

      return matchSearch && matchBatch && matchCity && matchProf && matchBlood && matchVol && matchDon && matchVer;
    });
  }, [alumniList, search, batchFilter, cityFilter, professionFilter, bloodFilter, volunteerFilter, donationFilter, verificationFilter, user]);

  // Sorting Logic
  const sortedAlumni = useMemo(() => {
    return [...filteredAlumni].sort((a, b) => {
      if (sortBy === 'name') {
        return (a.full_name || '').localeCompare(b.full_name || '');
      }
      if (sortBy === 'batch_desc') {
        return (b.passing_year || 0) - (a.passing_year || 0);
      }
      if (sortBy === 'batch_asc') {
        return (a.passing_year || 0) - (b.passing_year || 0);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [filteredAlumni, sortBy]);

  // Pagination Logic
  const totalRecords = sortedAlumni.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalRecords / pageSize);
  const startIndex = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const paginatedAlumni = pageSize === -1 ? sortedAlumni : sortedAlumni.slice(startIndex, startIndex + pageSize);

  // Metrics
  const totalCount = alumniList.length;
  const volunteersCount = alumniList.filter((a) => a.is_volunteer === 'YES').length;
  const donorsCount = alumniList.filter((a) => a.willing_to_donate === 'YES').length;
  const bloodGroupsCount = alumniList.filter((a) => a.blood_group && a.blood_group.trim()).length;
  const batchesWithAlumniCount = Array.from(batchCountsMap.keys()).length;

  const renderVerificationBadge = (status?: string) => {
    const s = (status || 'APPROVED').toUpperCase();
    if (s === 'APPROVED' || s === 'VERIFIED') {
      return (
        <span className="inline-flex items-center space-x-1 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>APPROVED</span>
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center space-x-1 font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-0.5 rounded-full text-[10px]">
          <Clock className="w-3 h-3 text-[#854D0E] shrink-0" />
          <span>PENDING</span>
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center space-x-1 font-bold text-red-800 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full text-[10px]">
          <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
          <span>REJECTED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 font-semibold text-gray-700 bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full text-[10px]">
        <span>{s}</span>
      </span>
    );
  };

  const renderPaginationBar = () => {
    if (totalRecords === 0) return null;

    return (
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
        {/* Records count & Per Page Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-600">
            {language === 'ta' ? 'காண்பிக்கப்படுகிறது:' : 'Showing'} <strong className="text-[#111111]">{totalRecords === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-[#111111]">{pageSize === -1 ? totalRecords : Math.min(startIndex + pageSize, totalRecords)}</strong> {language === 'ta' ? 'மொத்தம்' : 'of'} <strong className="text-[#111111]">{totalRecords}</strong> {language === 'ta' ? 'முன்னாள் மாணவர்கள்' : 'Alumni'}
          </span>

          <div className="flex items-center space-x-1.5 border-l border-gray-300 pl-3">
            <span className="text-gray-500">{language === 'ta' ? 'பக்கத்திற்கு:' : 'Per page:'}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-[#111111] focus:outline-none focus:border-[#F4C542] cursor-pointer shadow-2xs"
            >
              <option value={10}>10 {language === 'ta' ? 'பதிவுகள்' : 'per page'}</option>
              <option value={25}>25 {language === 'ta' ? 'பதிவுகள்' : 'per page'}</option>
              <option value={50}>50 {language === 'ta' ? 'பதிவுகள்' : 'per page'}</option>
              <option value={100}>100 {language === 'ta' ? 'பதிவுகள்' : 'per page'}</option>
              <option value={-1}>{language === 'ta' ? 'அனைத்து பதிவுகள்' : 'All Records'}</option>
            </select>
          </div>
        </div>

        {/* Page Navigation Buttons */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'ta' ? 'முந்தைய' : 'Prev'}</span>
            </button>

            {/* Dynamic Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) => (
                item === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item as number)}
                    className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                      currentPage === item
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                )
              ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 transition-colors text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>{language === 'ta' ? 'அடுத்த' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-[#111111] pb-12">
      {/* Header & Page Title */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                {language === 'ta' ? 'முன்னாள் மாணவர்கள் முகவரி & அறிக்கைகள்' : 'Global Alumni Directory & Reports'}
              </h2>
              <span className="bg-[#FFF7D6] text-[#854D0E] font-extrabold px-2.5 py-0.5 rounded-full text-xs border border-[#F4C542]">
                1962 - 2026
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              {language === 'ta'
                ? 'அனைத்து வகுப்பு ஆண்டுகள் மற்றும் நிறுவனங்களில் பணிபுரியும் முன்னாள் மாணவர்களின் முழு விவரங்கள்'
                : 'Complete verified alumni roster connected across all batch years with blood group, volunteer, and donor status.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchDirectoryData}
              disabled={loading}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 transition-colors flex items-center justify-center cursor-pointer"
              title="Refresh Directory Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'cards'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அட்டை பார்வை' : 'Cards View'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'table'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'அட்டவணை பார்வை' : 'Table View'} ({totalRecords})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('batch_summary')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
                viewMode === 'batch_summary'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'வகுப்பு சுருக்கம்' : 'All Batches Roster'} ({availableBatches.length})</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-[#111111]">{totalRecords}</strong> of {totalCount} Alumni
          </div>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#111111]">{totalCount}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {language === 'ta' ? 'மொத்த உறுப்பினர்கள்' : 'Total Alumni'}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 shadow-2xs flex items-center space-x-3 bg-gradient-to-br from-indigo-50/40 to-transparent">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-800 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-indigo-900">{availableBatches.length}</div>
              <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                {language === 'ta' ? 'வகுப்புகள் (1962-2026)' : 'Total Batches'}
              </div>
              <div className="text-[9px] text-indigo-500 font-semibold">{batchesWithAlumniCount} Connected</div>
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-2xs flex items-center space-x-3 bg-gradient-to-br from-emerald-50/40 to-transparent">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800 shrink-0">
              <HandHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-900">{volunteersCount}</div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {language === 'ta' ? 'தன்னார்வலர்கள்' : 'Volunteers (Yes)'}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-2xs flex items-center space-x-3 bg-gradient-to-br from-[#FFF7D6]/50 to-transparent">
            <div className="w-10 h-10 bg-[#FFF7D6] rounded-xl flex items-center justify-center text-[#854D0E] shrink-0">
              <Heart className="w-5 h-5 fill-[#854D0E]" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-[#854D0E]">{donorsCount}</div>
              <div className="text-[10px] font-bold text-[#854D0E] uppercase tracking-wider">
                {language === 'ta' ? 'நன்கொடையாளர்கள்' : 'Willing Donors'}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-rose-200 rounded-2xl p-4 shadow-2xs flex items-center space-x-3 bg-gradient-to-br from-rose-50/40 to-transparent col-span-2 lg:col-span-1">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-800 shrink-0">
              <Droplet className="w-5 h-5 fill-rose-600 text-rose-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-rose-900">{bloodGroupsCount}</div>
              <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                {language === 'ta' ? 'இரத்த வகை பதிவு' : 'Blood Group Logged'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'ta' ? 'பெயர், நிறுவனம், தொழில் மூலம் தேட...' : 'Search by name, company, city, profession...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-[#F4C542]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Batch Selector */}
          <select
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542] cursor-pointer"
          >
            <option value="ALL">{language === 'ta' ? `அனைத்து வகுப்புகள் (${availableBatches.length})` : `All Batches (${availableBatches.length})`}</option>
            {availableBatches.map(b => (
              <option key={b} value={String(b)}>Class of {b} ({batchCountsMap.get(b) || 0})</option>
            ))}
          </select>

          {/* Blood Group Filter */}
          <select
            value={bloodFilter}
            onChange={e => setBloodFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542] cursor-pointer text-rose-700 font-bold"
          >
            <option value="ALL">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
              <option key={bg} value={bg}>{bg} Blood Group</option>
            ))}
          </select>

          {/* Volunteer Filter */}
          <select
            value={volunteerFilter}
            onChange={e => setVolunteerFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542] cursor-pointer"
          >
            <option value="ALL">All Volunteers</option>
            <option value="YES">Volunteers Only (YES)</option>
            <option value="NO">Non-Volunteers</option>
          </select>

          {/* Donation Filter */}
          <select
            value={donationFilter}
            onChange={e => setDonationFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542] cursor-pointer"
          >
            <option value="ALL">All Donor Options</option>
            <option value="YES">Willing Donors Only (YES)</option>
            <option value="NO">Non-Donors</option>
          </select>

          {/* Verified Status Badge */}
          <div className="bg-[#FFF7D6] border border-[#F4C542] rounded-xl px-3 py-2 text-xs text-[#854D0E] font-extrabold flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Verified Alumni Roster Only</span>
          </div>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542] cursor-pointer"
          >
            <option value="ALL">All Cities ({uniqueCities.length})</option>
            {uniqueCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Profession Filter */}
          <select
            value={professionFilter}
            onChange={e => setProfessionFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F4C542] cursor-pointer"
          >
            <option value="ALL">All Professions ({uniqueProfessions.length})</option>
            {uniqueProfessions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 text-xs text-amber-800 font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
            <span className="text-gray-500">
              Filtered <strong className="text-[#111111]">{totalRecords}</strong> records
            </span>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: CARDS VIEW */}
      {viewMode === 'cards' && (
        loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#854D0E] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Loading verified alumni directory...</p>
          </div>
        ) : sortedAlumni.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedAlumni.map(a => (
              <div key={a.id || a.mobile || a.full_name} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-amber-300 transition-all">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full overflow-hidden border-2 border-[#F4C542] bg-[#FFF7D6] flex items-center justify-center shrink-0">
                    {a.profile_photo_url ? (
                      <img src={a.profile_photo_url} alt={a.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 sm:w-8 h-7 sm:h-8 text-[#854D0E]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#111111] truncate">{a.full_name}</h4>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[10px] font-semibold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-block border border-[#F4C542]/30">
                        Class of {a.passing_year}
                      </span>
                      {a.blood_group && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5 border border-rose-200">
                          <Droplet className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                          <span>{a.blood_group}</span>
                        </span>
                      )}
                      {a.is_volunteer === 'YES' && (
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5 border border-emerald-300">
                          <HandHeart className="w-2.5 h-2.5 text-emerald-600" />
                          <span>VOLUNTEER</span>
                        </span>
                      )}
                      {a.willing_to_donate === 'YES' && (
                        <span className="text-[10px] font-extrabold text-[#854D0E] bg-[#FFF7D6] px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5 border border-[#F4C542]">
                          <Heart className="w-2.5 h-2.5 fill-[#854D0E]" />
                          <span>DONOR</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6B7280] mt-2 space-y-1">
                      {a.profession && (
                        <div className="truncate flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="truncate">{a.profession} {a.company ? `@ ${a.company}` : ''}</span>
                        </div>
                      )}
                      {a.current_city && (
                        <div className="truncate flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{a.current_city} {a.state ? `, ${a.state}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => setSelectedAlumni(a)}
                    className="flex-1 py-2 text-xs font-bold text-[#111111] bg-[#FAFAFA] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-all text-center cursor-pointer"
                  >
                    View Full Details
                  </button>
                  {(() => {
                    if (isOwnAccount(a)) {
                      return (
                        <span className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl flex items-center justify-center space-x-1 cursor-default">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                          <span>You</span>
                        </span>
                      );
                    }
                    const connStatus = getConnectionStatus(a.id || a.mobile || a.full_name);
                    if (connStatus === 'ACCEPTED') {
                      return (
                        <button disabled className="px-3 py-2 text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center space-x-1 cursor-default">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected</span>
                        </button>
                      );
                    }
                    if (connStatus === 'PENDING') {
                      return (
                        <button disabled className="px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-center space-x-1 cursor-default">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sent</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => setConnectModalAlumni(a)}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-gray-800 rounded-xl transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#F4C542]" />
                        <span>Connect</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
            </div>

            {/* Pagination Controls for Cards View */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
              {renderPaginationBar()}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-3">
            <User className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-[#111111]">No Alumni Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No verified alumni match your filter criteria. Try clearing or expanding your search filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-gray-800 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )
      )}

      {/* VIEW MODE 2: BATCH SUMMARY VIEW */}
      {viewMode === 'batch_summary' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#111111]">
                {language === 'ta' ? 'அனைத்து வகுப்பு ஆண்டுகள் பட்டியல் (1962 - 2026)' : 'Complete Batch Roster & Distribution (1962 – 2026)'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Click any batch card to immediately filter the directory table.
              </p>
            </div>
            <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
              {batchesWithAlumniCount} Batches Registered / {availableBatches.length} Total Batches
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {availableBatches.map((b) => {
              const count = batchCountsMap.get(b) || 0;
              const isSelected = batchFilter === String(b);

              return (
                <div
                  key={b}
                  onClick={() => {
                    setBatchFilter(isSelected ? 'ALL' : String(b));
                    setViewMode('table');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-center group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#FFF7D6] to-amber-100 border-[#F4C542] shadow-md ring-2 ring-[#F4C542]'
                      : count > 0
                      ? 'bg-white hover:bg-amber-50/60 border-amber-200 shadow-2xs'
                      : 'bg-gray-50/70 hover:bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Batch of</div>
                  <div className={`text-xl font-extrabold ${count > 0 ? 'text-[#111111]' : 'text-gray-400'}`}>
                    {b}
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      count > 0
                        ? 'bg-[#854D0E] text-white shadow-2xs'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count} {count === 1 ? 'Alumnus' : 'Alumni'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-[#111111]">
                {language === 'ta' ? 'முன்னாள் மாணவர்கள் பட்டியல் அட்டவணை' : 'Detailed Alumni Directory Table'}
              </h3>
              {batchFilter !== 'ALL' && (
                <span className="bg-[#FFF7D6] text-[#854D0E] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#F4C542]">
                  Batch {batchFilter}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="font-semibold text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg font-bold text-[#111111] focus:outline-none cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="batch_desc">Batch (Newest)</option>
                <option value="batch_asc">Batch (Oldest)</option>
              </select>

              <span className="font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                {totalRecords} Records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto table-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Alumnus Profile</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Volunteer</th>
                  <th className="py-3.5 px-4">Donor</th>
                  <th className="py-3.5 px-4">Location & Profession</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-xs font-medium">
                {paginatedAlumni.length > 0 ? (
                  paginatedAlumni.map((alumnus, idx) => {
                    const photoSrc = alumnus.profile_photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.full_name)}&background=F3F4F6&color=111111`;
                    const isVol = alumnus.is_volunteer === 'YES';
                    const isDon = alumnus.willing_to_donate === 'YES';
                    const rowNum = startIndex + idx + 1;

                    return (
                      <tr key={alumnus.id || idx} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-400 text-[11px] whitespace-nowrap">
                          {rowNum}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={photoSrc}
                              alt={alumnus.full_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-[#F4C542] shrink-0"
                            />
                            <div>
                              <div className="font-bold text-[#111111] text-sm">{alumnus.full_name}</div>
                              {(alumnus.name_ta || alumnus.full_name_ta) && (
                                <div className="text-[10px] text-gray-500 font-serif">{alumnus.name_ta || alumnus.full_name_ta}</div>
                              )}
                              {alumnus.email && alumnus.email_visible && (
                                <div className="text-[11px] text-gray-500 truncate max-w-[160px]">{alumnus.email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2.5 py-0.5 rounded-full text-[11px]">
                            Batch {alumnus.passing_year || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {alumnus.blood_group ? (
                            <span className="inline-flex items-center space-x-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px]">
                              <Droplet className="w-3 h-3 fill-rose-600 text-rose-600" />
                              <span>{alumnus.blood_group}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isVol ? (
                            <span className="inline-flex items-center space-x-1 font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>VOLUNTEER</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-[10px]">
                              <span>NO</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isDon ? (
                            <span className="inline-flex items-center space-x-1 font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-0.5 rounded-full text-[10px]">
                              <Heart className="w-3 h-3 fill-[#854D0E] text-[#854D0E]" />
                              <span>WILLING</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-[10px]">
                              <span>NO</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          {alumnus.profession && (
                            <div className="flex items-center space-x-1 font-bold text-[#111111]">
                              <Briefcase className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {alumnus.profession} {alumnus.company ? `@ ${alumnus.company}` : ''}
                              </span>
                            </div>
                          )}
                          {alumnus.current_city && (
                            <div className="flex items-center space-x-1 text-gray-600 text-[11px] font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {alumnus.current_city}
                                {alumnus.state ? `, ${alumnus.state}` : ''}
                              </span>
                            </div>
                          )}
                          {!alumnus.profession && !alumnus.current_city && <span className="text-gray-400 text-[11px]">-</span>}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedAlumni(alumnus)}
                              className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              View
                            </button>
                            {(() => {
                              if (isOwnAccount(alumnus)) return null;
                              const connStatus = getConnectionStatus(alumnus.id || alumnus.mobile || alumnus.full_name);
                              if (connStatus === 'ACCEPTED') {
                                return (
                                  <span className="px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-lg inline-flex items-center space-x-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Connected</span>
                                  </span>
                                );
                              }
                              if (connStatus === 'PENDING') {
                                return (
                                  <span className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-lg inline-flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>Sent</span>
                                  </span>
                                );
                              }
                              return (
                                <button
                                  onClick={() => setConnectModalAlumni(alumnus)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#854D0E] hover:bg-amber-900 rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                                >
                                  <UserPlus className="w-3 h-3 text-[#F4C542]" />
                                  <span>Connect</span>
                                </button>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="font-bold text-sm">No alumni records found matching filter criteria.</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl border border-gray-300 transition-all cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {renderPaginationBar()}
        </div>
      )}

      {/* Comprehensive Alumni Profile Modal (Showing ALL Details properly) */}
      {selectedAlumni && (
        <AlumniDetailModal
          alumni={selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
          isOwnAccount={isOwnAccount(selectedAlumni)}
          connectionStatus={getConnectionStatus(selectedAlumni.id || selectedAlumni.mobile || selectedAlumni.full_name)}
          onConnectClick={(a) => {
            setConnectModalAlumni(a);
            setSelectedAlumni(null);
          }}
        />
      )}

      {/* Connect Message Modal */}
      {connectModalAlumni && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setConnectModalAlumni(null)} className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#111111]">Connect with {connectModalAlumni.full_name}</h3>
            <p className="text-xs text-gray-500">Include a friendly greeting message with your connection request.</p>

            <textarea
              rows={4}
              value={connectMessage}
              onChange={e => setConnectMessage(e.target.value)}
              placeholder="Hi! I am also an alumnus of our school. Would love to connect..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs focus:outline-none focus:border-[#F4C542]"
            ></textarea>

            <button
              onClick={() => {
                if (connectModalAlumni) {
                  sendConnectionRequest(connectModalAlumni, connectMessage);
                  const name = connectModalAlumni.full_name;
                  setConnectModalAlumni(null);
                  setConnectMessage('');
                  setConnections(getConnectionsStore());
                  Swal.fire({
                    icon: 'success',
                    title: language === 'ta' ? 'கோரிக்கை அனுப்பப்பட்டது!' : 'Connection Request Sent',
                    text: language === 'ta'
                      ? `${name}-க்கு இணைப்பு கோரிக்கை வெற்றிகரமாக அனுப்பப்பட்டது.`
                      : `Your connection request was sent to ${name}. It will appear under Friends & Connections.`,
                    confirmButtonColor: '#111111'
                  });
                }
              }}
              className="w-full py-2.5 bg-[#111111] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-black cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Send Connection Request</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
