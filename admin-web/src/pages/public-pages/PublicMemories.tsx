import React, { useEffect, useState } from 'react';
import {
  Trophy, Search, Award, User, X
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';
import { RankHolder } from '../../types';
import { PublicMemoriesShowcase } from './components/PublicMemoriesShowcase';

export const PublicMemories: React.FC = () => {
  const { t, language } = useLanguage();

  // State for Rank Holders (Pure Backend DB)
  const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
  const [loadingRankHolders, setLoadingRankHolders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedHolderModal, setSelectedHolderModal] = useState<RankHolder | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  useEffect(() => {
    // Fetch Rank Holders from Backend DB
    api.getPublicRankHolders()
      .then((r) => setRankHolders(r || []))
      .catch(() => setRankHolders([]))
      .finally(() => setLoadingRankHolders(false));
  }, []);

  // Reset pagination count when search or filter changes
  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm, selectedYear]);

  // Extract unique academic years sorted descending
  const uniqueYears = Array.from(new Set(rankHolders.map(h => h.academic_year))).sort().reverse();

  // Filter Rank Holders
  const filteredRankHolders = rankHolders.filter(h => {
    const matchesSearch = !searchTerm ||
      h.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.achievement_title && h.achievement_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear = !selectedYear || h.academic_year === selectedYear;

    return matchesSearch && matchesYear;
  });

  const displayedRankHolders = filteredRankHolders.slice(0, visibleCount);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn font-sans min-h-screen">
      {/* Header Banner */}
      <div className="py-10 sm:py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight">
            {t('memories_page_title')}
          </h1>
          <p className="text-xs sm:text-base text-gray-600 max-w-2xl mx-auto font-normal">
            {language === 'ta'
              ? 'பள்ளி நினைவுகள், சிறப்பு புகைப்படங்கள், வீடியோக்கள் மற்றும் சிறந்த சாதனை மாணவர்களின் விவரங்கள்.'
              : 'Cherished school photo albums, celebration videos, heritage archives, and academic rank holder achievements.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">

        {/* ========================================================================= */}
        {/* SECTION 1: SCHOOL RANK HOLDERS & ACHIEVERS */}
        {/* ========================================================================= */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 border-b border-gray-200">
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? 'நமது பள்ளி சாதனையாளர்கள்' : 'School Rank Holders & Achievers'}</span>
              </span>

              <h2 className="text-xl sm:text-4xl font-bold text-[#111111]">
                {language === 'ta' ? 'கல்விச் சிறப்பும் விருதுகளும்' : 'Academic Excellence & Rank Holders'}
              </h2>
            </div>

            {/* Search & Academic Year Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'மாணவர் பெயர் தேட...' : 'Search student or rank...'}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(8);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#F4C542] bg-gray-50 font-medium"
                />
              </div>

              <div className="w-full sm:w-56">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setVisibleCount(8);
                  }}
                  className="w-full text-xs p-2.5 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#F4C542] font-semibold bg-gray-50 cursor-pointer"
                >
                  <option value="">
                    {language === 'ta' ? 'அனைத்து ஆண்டுகள் (All Years)' : 'All Academic Years'}
                  </option>
                  {uniqueYears.map(yr => (
                    <option key={yr} value={yr}>
                      Academic Year: {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rank Holders Grid / Table */}
          {loadingRankHolders ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              Loading Rank Holders...
            </div>
          ) : displayedRankHolders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-2 p-6">
              <Award className="w-10 h-10 text-[#854D0E] mx-auto opacity-70" />
              <h4 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'சாதனையாளர்கள் பட்டியல் எதுவும் பதிவேற்றப்படவில்லை' : 'No Rank Holders Added Yet'}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Academic achievers will appear here once published by the school administration.
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#111111] rounded-3xl shadow-[4px_4px_0px_0px_#111111] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#111111] text-white uppercase text-[11px] font-extrabold tracking-wider">
                      <th className="py-3.5 px-4 text-center w-12">{language === 'ta' ? 'எண்' : '#'}</th>
                      <th className="py-3.5 px-4">{language === 'ta' ? 'மாணவர் பெயர்' : 'Student Name'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'ta' ? 'கல்வியாண்டு' : 'Academic Year'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'ta' ? 'வகுப்பு' : 'Class / Standard'}</th>
                      <th className="py-3.5 px-4 text-center">{language === 'ta' ? 'பெற்ற மதிப்பெண்கள்' : 'Marks Secured'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium">
                    {displayedRankHolders.map((holder, idx) => (
                      <tr
                        key={holder.id}
                        onClick={() => setSelectedHolderModal(holder)}
                        className="hover:bg-[#FFF7D6]/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-sm text-[#111111] group-hover:text-[#854D0E] transition-colors">
                            {language === 'ta' && holder.student_name_ta ? holder.student_name_ta : holder.student_name}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-800 text-xs">
                            {holder.academic_year}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-bold text-gray-700">
                          {holder.class_standard || '10th'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm text-[#111111]">
                          {holder.total_marks ? (
                            <span>
                              {holder.total_marks}
                              <span className="text-xs text-gray-400 font-normal"> / {holder.max_marks || (Number(holder.total_marks) > 500 ? '1200' : '500')}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs font-normal">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleCount < filteredRankHolders.length && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="px-6 py-2 bg-white border border-gray-300 text-[#111111] hover:bg-gray-100 font-bold text-xs rounded-full shadow-sm transition-all"
                  >
                    {language === 'ta' ? `மேலும் பார்க்க (${filteredRankHolders.length - visibleCount} மீதம்)` : `View More (${filteredRankHolders.length - visibleCount} remaining)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SCHOOL PHOTO & VIDEO MEMORIES SHOWCASE */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-gray-200">
          <PublicMemoriesShowcase />
        </div>

      </div>

      {/* RANK HOLDER LIGHTBOX MODAL */}
      {selectedHolderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden p-6 text-center space-y-6">
            <button
              onClick={() => setSelectedHolderModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-[#F4C542] shadow-xl bg-[#FFF7D6] flex items-center justify-center text-[#854D0E]">
              {selectedHolderModal.photograph ? (
                <img
                  src={getAssetUrl(selectedHolderModal.photograph)}
                  alt={selectedHolderModal.student_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-14 h-14 stroke-[2.2] text-[#854D0E]" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-extrabold bg-[#111111] text-[#F4C542] px-4 py-1 rounded-full uppercase tracking-wider inline-block">
                {selectedHolderModal.rank}
              </span>
              <h3 className="text-2xl font-bold text-[#111111]">{selectedHolderModal.student_name}</h3>
              <p className="text-xs text-[#854D0E] font-semibold">{selectedHolderModal.achievement_title || 'School Academic Rank Holder'}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Academic Year:</span>
                <span className="font-bold text-[#111111]">{selectedHolderModal.academic_year}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Class / Standard:</span>
                <span className="font-bold text-[#111111]">{selectedHolderModal.class_standard || '10th Standard'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Exam / Achievement:</span>
                <span className="font-bold text-[#111111]">{selectedHolderModal.achievement_type || 'SSLC / Public Examination'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Marks / Score:</span>
                <span className="font-bold text-emerald-700">{selectedHolderModal.marks_percentage || 'N/A'}</span>
              </div>
              {selectedHolderModal.description && (
                <div className="pt-1 text-gray-600 leading-relaxed">
                  {selectedHolderModal.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
