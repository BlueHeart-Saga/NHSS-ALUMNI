import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, HandHeart, Heart, Droplet, Search, Download, Filter, 
  CheckCircle2, XCircle, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Calendar, ShieldCheck, Clock, AlertCircle, ChevronLeft, ChevronRight, RefreshCw,
  X, FileSpreadsheet, Layers, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { AlumniProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StatsGridSkeleton } from '../../components/EmptyState';

export const AlumniDataReportsModule: React.FC = () => {
  const { language } = useLanguage();
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [availableBatches, setAvailableBatches] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'table' | 'batch_summary'>('table');

  // Filter & Sort States
  const [search, setSearch] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [selectedVolunteerStatus, setSelectedVolunteerStatus] = useState<string>('');
  const [selectedDonationStatus, setSelectedDonationStatus] = useState<string>('');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name' | 'batch_desc' | 'batch_asc'>('date_desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch directory records (ALL statuses) and public batch definitions
      const [dirData, batchData] = await Promise.all([
        api.getDirectory('', undefined, 'ALL').catch(() => 
          api.searchAlumni('', undefined, 'ALL').catch(() => api.getAlumniDirectory())
        ),
        api.getPublicBatches().catch(() => [])
      ]);

      const records: AlumniProfile[] = dirData || [];
      setAlumniList(records);

      // Generate complete school batch list from 1962 to 2026
      const currentYear = new Date().getFullYear();
      const defaultSchoolYears = Array.from({ length: currentYear - 1962 + 1 }, (_, i) => currentYear - i);
      
      const batchYearsFromApi = (batchData || []).map((b: any) => b.passing_year).filter(Boolean);
      const batchYearsFromAlumni = records.map((a: any) => a.passing_year).filter(Boolean);
      
      const combinedYears = Array.from(new Set([...defaultSchoolYears, ...batchYearsFromApi, ...batchYearsFromAlumni]))
        .sort((a, b) => b - a);

      setAvailableBatches(combinedYears);
    } catch (err) {
      console.error('Failed to load directory reports data:', err);
      setAlumniList([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBatch, selectedBloodGroup, selectedVolunteerStatus, selectedDonationStatus, selectedVerificationStatus, sortBy]);

  // Batch Distribution Counts Map
  const batchCountsMap = useMemo(() => {
    const map = new Map<number, number>();
    alumniList.forEach((a) => {
      if (a.passing_year) {
        map.set(a.passing_year, (map.get(a.passing_year) || 0) + 1);
      }
    });
    return map;
  }, [alumniList]);

  // Active Filter Check
  const hasActiveFilters = Boolean(
    search || selectedBatch || selectedBloodGroup || selectedVolunteerStatus || selectedDonationStatus || selectedVerificationStatus
  );

  const clearAllFilters = () => {
    setSearch('');
    setSelectedBatch('');
    setSelectedBloodGroup('');
    setSelectedVolunteerStatus('');
    setSelectedDonationStatus('');
    setSelectedVerificationStatus('');
    setSortBy('date_desc');
  };

  // Filter Logic
  const filteredAlumni = useMemo(() => {
    return alumniList.filter((a) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || (
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.mobile || '').toLowerCase().includes(q) ||
        (a.current_city || '').toLowerCase().includes(q) ||
        (a.state || '').toLowerCase().includes(q) ||
        (a.profession || '').toLowerCase().includes(q) ||
        (a.company || '').toLowerCase().includes(q) ||
        (a.admission_number || '').toLowerCase().includes(q) ||
        (a.section || '').toLowerCase().includes(q) ||
        String(a.passing_year || '').includes(q)
      );

      const matchesBatch = !selectedBatch || String(a.passing_year) === selectedBatch;
      const matchesBlood = !selectedBloodGroup || (a.blood_group || '').toUpperCase() === selectedBloodGroup.toUpperCase();
      const matchesVolunteer = !selectedVolunteerStatus || (
        selectedVolunteerStatus === 'YES' ? a.is_volunteer === 'YES' : a.is_volunteer !== 'YES'
      );
      const matchesDonation = !selectedDonationStatus || (
        selectedDonationStatus === 'YES' ? a.willing_to_donate === 'YES' : a.willing_to_donate !== 'YES'
      );
      const matchesVerification = !selectedVerificationStatus || (
        (a.verification_status || 'APPROVED').toUpperCase() === selectedVerificationStatus.toUpperCase()
      );

      return matchesSearch && matchesBatch && matchesBlood && matchesVolunteer && matchesDonation && matchesVerification;
    });
  }, [alumniList, search, selectedBatch, selectedBloodGroup, selectedVolunteerStatus, selectedDonationStatus, selectedVerificationStatus]);

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
      // Default: date_desc
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [filteredAlumni, sortBy]);

  // Pagination Logic
  const totalRecords = sortedAlumni.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalRecords / pageSize);
  const startIndex = pageSize === -1 ? 0 : (currentPage - 1) * pageSize;
  const paginatedAlumni = pageSize === -1 ? sortedAlumni : sortedAlumni.slice(startIndex, startIndex + pageSize);

  // Calculate Summary Metrics
  const totalCount = alumniList.length;
  const volunteersCount = alumniList.filter((a) => a.is_volunteer === 'YES').length;
  const donorsCount = alumniList.filter((a) => a.willing_to_donate === 'YES').length;
  const bloodGroupsCount = alumniList.filter((a) => a.blood_group && a.blood_group.trim()).length;
  const batchesWithAlumniCount = Array.from(batchCountsMap.keys()).length;

  // Blood Group Options
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Client-side CSV export of current filtered view
  const downloadFilteredCSV = () => {
    const headers = [
      'Name', 'Passing Year', 'Section', 'Admission No', 'Registration Date',
      'Mobile', 'Email', 'Blood Group', 'Is Volunteer', 'Willing to Donate',
      'Verification Status', 'Profession', 'Company', 'City', 'State'
    ];

    const rows = sortedAlumni.map((a) => [
      `"${(a.full_name || '').replace(/"/g, '""')}"`,
      a.passing_year || '',
      `"${a.section || ''}"`,
      `"${a.admission_number || ''}"`,
      a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '',
      `"${a.mobile || ''}"`,
      `"${a.email || ''}"`,
      `"${a.blood_group || ''}"`,
      a.is_volunteer || 'NO',
      a.willing_to_donate || 'NO',
      a.verification_status || 'APPROVED',
      `"${(a.profession || '').replace(/"/g, '""')}"`,
      `"${(a.company || '').replace(/"/g, '""')}"`,
      `"${(a.current_city || '').replace(/"/g, '""')}"`,
      `"${(a.state || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alumni_filtered_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status?: string) => {
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-[#111111] font-sans pb-12">
      {/* Page Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {language === 'ta'
                ? 'முன்னாள் மாணவர்கள் அறிக்கை & தன்னார்வலர்கள் தரவு'
                : 'Alumni Directory & Batch Reports'}
            </h2>
            <span className="bg-[#F4C542]/20 text-[#854D0E] font-extrabold px-2.5 py-0.5 rounded-full text-xs border border-[#F4C542]">
              1962 - 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {language === 'ta'
              ? 'அனைத்து வகுப்புகள் (1962 - 2026) மற்றும் பதிவுகளின் தொடர்பு விவரங்கள், இரத்த வகை, தன்னார்வலர் நிலை மற்றும் நிதியுதவி விருப்பத் தகவல்கள்.'
              : 'Comprehensive database connected across all batch years (1962–2026) with blood group registry, volunteer & donor status.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer border border-gray-300 flex items-center justify-center shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={downloadFilteredCSV}
            disabled={sortedAlumni.length === 0}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Download current filtered data as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>{language === 'ta' ? 'வடிகட்டிய CSV' : 'Filtered CSV'}</span>
          </button>

          <a
            href={api.getAlumniCSVExportUrl()}
            download
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md border border-[#E0B238] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#111111]" />
            <span>{language === 'ta' ? 'முழு CSV அறிக்கை' : 'Export Full CSV'}</span>
          </a>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      {loading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
          <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-800 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-extrabold text-[#111111]">{totalCount}</div>
              <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === 'ta' ? 'மொத்த உறுப்பினர்கள்' : 'Total Alumni'}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-indigo-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center space-x-3 bg-gradient-to-br from-indigo-50/40 to-transparent">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-800 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-extrabold text-indigo-900">{availableBatches.length}</div>
              <div className="text-[10px] sm:text-xs font-bold text-indigo-700 uppercase tracking-wider">
                {language === 'ta' ? 'வகுப்புகள் (1962-2026)' : 'Total Batches'}
              </div>
              <div className="text-[9px] text-indigo-500 font-semibold">{batchesWithAlumniCount} Connected</div>
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center space-x-3 bg-gradient-to-br from-emerald-50/40 to-transparent">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 shrink-0">
              <HandHeart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-extrabold text-emerald-900">{volunteersCount}</div>
              <div className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {language === 'ta' ? 'தன்னார்வலர்கள்' : 'Volunteers (Yes)'}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center space-x-3 bg-gradient-to-br from-[#FFF7D6]/50 to-transparent">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFF7D6] rounded-2xl flex items-center justify-center text-[#854D0E] shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-[#854D0E]" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-extrabold text-[#854D0E]">{donorsCount}</div>
              <div className="text-[10px] sm:text-xs font-bold text-[#854D0E] uppercase tracking-wider">
                {language === 'ta' ? 'நன்கொடையாளர்கள்' : 'Willing Donors'}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-rose-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center space-x-3 bg-gradient-to-br from-rose-50/40 to-transparent col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-800 shrink-0">
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-600 text-rose-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-extrabold text-rose-900">{bloodGroupsCount}</div>
              <div className="text-[10px] sm:text-xs font-bold text-rose-700 uppercase tracking-wider">
                {language === 'ta' ? 'இரத்த வகை பதிவு' : 'Blood Group Logged'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & View Switcher */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'table'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'ta' ? 'அறிக்கை அட்டவணை' : 'Detailed Directory Table'} ({totalRecords})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch_summary')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'batch_summary'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'ta' ? 'அனைத்து வகுப்பு ஆண்டுகள் (1962-2026)' : 'All Batch Summary View'} ({availableBatches.length})</span>
          </button>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold border border-red-200 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'வடிகட்டிகளை நீக்குக' : 'Clear Filters'}</span>
          </button>
        )}
      </div>

      {/* Quick Batch Selector Pill Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-gray-700">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-[#854D0E]" />
            <span>{language === 'ta' ? 'விரைவு வகுப்பு தேர்வு (All Batches 1962 - 2026):' : 'Quick Batch Selector (1962 – 2026):'}</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">
            {selectedBatch ? `Showing Batch ${selectedBatch}` : `All ${availableBatches.length} Batches Listed`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedBatch('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              !selectedBatch
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            All Batches ({alumniList.length})
          </button>

          {availableBatches.map((b) => {
            const count = batchCountsMap.get(b) || 0;
            const isSelected = selectedBatch === String(b);

            return (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBatch(isSelected ? '' : String(b))}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-[#854D0E] text-white shadow-xs'
                    : count > 0
                    ? 'bg-amber-100 text-[#854D0E] hover:bg-amber-200 border border-amber-300'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>'{String(b).slice(-2)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : count > 0 ? 'bg-[#854D0E] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: ALL BATCH SUMMARY VIEW */}
      {activeTab === 'batch_summary' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#111111]">
                {language === 'ta' ? 'அனைத்து வகுப்பு ஆண்டுகள் பட்டியல் (1962 - 2026)' : 'Complete Batch Roster & Distribution (1962 – 2026)'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Click any batch card to immediately filter the directory report table.
              </p>
            </div>
            <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
              {batchesWithAlumniCount} Batches Registered / {availableBatches.length} Total Batches
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {availableBatches.map((b) => {
              const count = batchCountsMap.get(b) || 0;
              const isSelected = selectedBatch === String(b);

              return (
                <div
                  key={b}
                  onClick={() => {
                    setSelectedBatch(isSelected ? '' : String(b));
                    setActiveTab('table');
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

      {/* VIEW 2: DETAILED TABLE & FILTERS */}
      {activeTab === 'table' && (
        <>
          {/* Filter & Search Bar Controls */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search Text */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'பெயர், மின்னஞ்சல், நகரைத் தேடுக...' : 'Search name, email, city, profession, admission no...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all"
                />
              </div>

              {/* Filter by Batch (ALL Batches 1962-2026 Connected) */}
              <div>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">{language === 'ta' ? 'அனைத்து வகுப்புகளும் (All Batches)' : 'All Batches (1962-2026)'}</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={String(b)}>
                      Batch of {b} ({(batchCountsMap.get(b) || 0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Blood Group */}
              <div>
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">{language === 'ta' ? 'அனைத்து இரத்த வகைகளும்' : 'All Blood Groups'}</option>
                  {bloodGroupOptions.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Group
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Volunteer Status */}
              <div>
                <select
                  value={selectedVolunteerStatus}
                  onChange={(e) => setSelectedVolunteerStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">{language === 'ta' ? 'அனைத்து தன்னார்வலர் நிலை' : 'All Volunteers'}</option>
                  <option value="YES">{language === 'ta' ? 'தன்னார்வலர்கள் மட்டும் (YES)' : 'Volunteers Only (YES)'}</option>
                  <option value="NO">{language === 'ta' ? 'தன்னார்வலர்கள் அல்லாதோர்' : 'Non-Volunteers'}</option>
                </select>
              </div>

              {/* Filter by Verification Status */}
              <div>
                <select
                  value={selectedVerificationStatus}
                  onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">{language === 'ta' ? 'அனைத்து சரிபார்ப்பு நிலை' : 'All Statuses'}</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            {/* Sort & Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <span>{language === 'ta' ? 'வரிசைப்படுத்துக:' : 'Sort By:'}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="ml-2 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-[#111111] border border-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="date_desc">{language === 'ta' ? 'புதிய பதிவு முதல்' : 'Newest Registration Date'}</option>
                    <option value="date_asc">{language === 'ta' ? 'பழைய பதிவு முதல்' : 'Oldest Registration Date'}</option>
                    <option value="name">{language === 'ta' ? 'பெயர் அகரவரிசை (A-Z)' : 'Name (A to Z)'}</option>
                    <option value="batch_desc">{language === 'ta' ? 'வகுப்பு (புதியது முதல்)' : 'Batch Year (Newest First)'}</option>
                    <option value="batch_asc">{language === 'ta' ? 'வகுப்பு (பழையது முதல்)' : 'Batch Year (Oldest First)'}</option>
                  </select>
                </div>

                <div>
                  <span>{language === 'ta' ? 'பக்கத்திற்கு:' : 'Per Page:'}</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-[#111111] border border-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                    <option value={500}>500</option>
                    <option value={-1}>{language === 'ta' ? 'அனைத்தும்' : 'All Records'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#111111]">
                  {totalRecords > 0
                    ? `${startIndex + 1}–${Math.min(startIndex + (pageSize === -1 ? totalRecords : pageSize), totalRecords)} of ${totalRecords} ${language === 'ta' ? 'பதிவுகள்' : 'Records'}`
                    : `0 ${language === 'ta' ? 'பதிவுகள்' : 'Records'}`}
                </span>
              </div>
            </div>
          </div>

          {/* FULL ALUMNI REPORT TABLE VIEW */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-[#111111]">
                  {language === 'ta' ? 'முன்னாள் மாணவர்கள் பட்டியல் அறிக்கை' : 'Detailed Alumni Directory Report'}
                </h3>
                {selectedBatch && (
                  <span className="bg-[#FFF7D6] text-[#854D0E] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#F4C542]">
                    Filtered: Batch {selectedBatch}
                  </span>
                )}
              </div>

              <span className="text-xs font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                {totalRecords} {language === 'ta' ? 'பதிவுகள்' : 'Records Found'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-600">
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'முன்னாள் மாணவர்' : 'Alumnus Profile'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'வகுப்பு ஆண்டு' : 'Batch'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'பதிவு தேதி' : 'Registered Date'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'தொடர்பு விவரங்கள்' : 'Contact Details'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'இரத்த வகை' : 'Blood Group'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'தன்னார்வலர்' : 'Volunteer'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'நன்கொடை விருப்பம்' : 'Donation Willing'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'நிலையான நிலை' : 'Verification Status'}</th>
                    <th className="py-3.5 px-4">{language === 'ta' ? 'நகரம் / தொழில்' : 'Location & Profession'}</th>
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
                        <tr key={alumnus.id} className="hover:bg-amber-50/40 transition-colors">
                          {/* Row Index */}
                          <td className="py-3 px-4 font-semibold text-gray-400 text-[11px] whitespace-nowrap">
                            {rowNum}
                          </td>

                          {/* Name & Photo */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={photoSrc}
                                alt={alumnus.full_name}
                                className="w-10 h-10 rounded-full object-cover border border-gray-300 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-[#111111] text-sm">{alumnus.full_name}</div>
                                <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                                  {alumnus.admission_number && <span>Adm: {alumnus.admission_number}</span>}
                                  {alumnus.section && <span>Sec: {alumnus.section}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Batch */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-block font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2.5 py-1 rounded-full text-[11px]">
                              Batch {alumnus.passing_year || 'N/A'}
                            </span>
                          </td>

                          {/* Registered Date */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-[11px] text-gray-600 flex items-center space-x-1 font-semibold">
                              <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{formatDate(alumnus.created_at)}</span>
                            </span>
                          </td>

                          {/* Contact Details */}
                          <td className="py-3 px-4 space-y-1">
                            {alumnus.mobile && alumnus.mobile !== '***' && (
                              <a
                                href={`tel:${alumnus.mobile}`}
                                className="flex items-center space-x-1.5 text-gray-800 hover:text-indigo-600 font-semibold transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{alumnus.mobile}</span>
                              </a>
                            )}
                            {alumnus.email && alumnus.email !== '***' && (
                              <a
                                href={`mailto:${alumnus.email}`}
                                className="flex items-center space-x-1.5 text-gray-600 hover:text-indigo-600 text-[11px] transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate max-w-[160px]">{alumnus.email}</span>
                              </a>
                            )}
                          </td>

                          {/* Blood Group */}
                          <td className="py-3 px-4">
                            {alumnus.blood_group ? (
                              <span className="inline-flex items-center space-x-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-[11px]">
                                <Droplet className="w-3 h-3 fill-rose-600 text-rose-600" />
                                <span>{alumnus.blood_group}</span>
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Volunteer Status (Yes/No) */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isVol ? (
                              <span className="inline-flex items-center space-x-1 font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>VOLUNTEER (YES)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full text-[11px]">
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                <span>NO</span>
                              </span>
                            )}
                          </td>

                          {/* Willing to Donate Status (Yes/No) */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isDon ? (
                              <span className="inline-flex items-center space-x-1 font-extrabold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-2.5 py-1 rounded-full text-[11px]">
                                <Heart className="w-3.5 h-3.5 fill-[#854D0E] text-[#854D0E]" />
                                <span>WILLING (YES)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full text-[11px]">
                                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                <span>NO</span>
                              </span>
                            )}
                          </td>

                          {/* Verification Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {renderStatusBadge(alumnus.verification_status)}
                          </td>

                          {/* Location & Profession */}
                          <td className="py-3 px-4 space-y-1">
                            {alumnus.profession && (
                              <div className="flex items-center space-x-1 font-semibold text-[#111111]">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{alumnus.profession}</span>
                              </div>
                            )}
                            {alumnus.current_city && (
                              <div className="flex items-center space-x-1 text-gray-500 text-[11px]">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{alumnus.current_city}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-500">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-sm">
                          {language === 'ta' ? 'குறிப்பிட்ட அளவுகோல்களுடன் எந்த உறுப்பினர்களும் கிடைக்கவில்லை' : 'No alumni records found matching filter criteria.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearAllFilters}
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

            {/* Pagination Footer Controls */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {language === 'ta'
                    ? `பக்கம் ${currentPage} / ${totalPages}`
                    : `Page ${currentPage} of ${totalPages}`}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{language === 'ta' ? 'முந்தைய' : 'Previous'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pNum = currentPage - 3 + i;
                        if (pNum > totalPages) pNum = totalPages - (4 - i);
                      }
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setCurrentPage(pNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pNum
                              ? 'bg-[#111111] text-white shadow-xs'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{language === 'ta' ? 'அடுத்தது' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
