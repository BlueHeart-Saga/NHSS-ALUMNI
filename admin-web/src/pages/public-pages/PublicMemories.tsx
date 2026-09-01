import React, { useEffect, useState } from 'react';
import { ArrowRight, Image as ImageIcon, X, Trophy, Medal, Search, ChevronDown, Plus, Info } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';
import { RankHolder } from '../../types';

export const PublicMemories: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // State for Memories Gallery (Pure Backend DB)
  const [memories, setMemories] = useState<any[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  // State for Rank Holders (Pure Backend DB)
  const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
  const [loadingRankHolders, setLoadingRankHolders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedHolderModal, setSelectedHolderModal] = useState<RankHolder | null>(null);

  // Pagination State (Show initial 6, expand by +3 on Load More)
  const [visibleCount, setVisibleCount] = useState<number>(6);

  useEffect(() => {
    // Fetch Memories from Backend DB
    api.getPublicMemories()
      .then((m) => setMemories(m || []))
      .catch(() => setMemories([]))
      .finally(() => setLoadingMemories(false));

    // Fetch Rank Holders from Backend DB
    api.getPublicRankHolders()
      .then((r) => setRankHolders(r || []))
      .catch(() => setRankHolders([]))
      .finally(() => setLoadingRankHolders(false));
  }, []);

  // Reset pagination count when search or filter changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm, selectedYear]);

  // Extract unique academic years sorted descending
  const uniqueYears = Array.from(new Set(rankHolders.map(h => h.academic_year))).sort().reverse();

  // Filter Rank Holders based on search and selected academic year
  const filteredRankHolders = rankHolders.filter(h => {
    const matchesSearch = !searchTerm ||
      h.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.achievement_title && h.achievement_title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear = !selectedYear || h.academic_year === selectedYear;

    return matchesSearch && matchesYear;
  });

  // Display sliced items according to visibleCount (Initial 6, expand +3)
  const displayedRankHolders = filteredRankHolders.slice(0, visibleCount);

  const getRankBadgeStyle = (rankStr: string) => {
    const lower = rankStr.toLowerCase();
    if (lower.includes('1st') || lower.includes('first')) {
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300';
    }
    if (lower.includes('2nd') || lower.includes('second')) {
      return 'bg-gradient-to-r from-slate-300 to-gray-400 text-black border-slate-200';
    }
    if (lower.includes('3rd') || lower.includes('third')) {
      return 'bg-gradient-to-r from-amber-700 to-yellow-800 text-white border-amber-600';
    }
    return 'bg-[#111111] text-[#F4C542] border-[#F4C542]/60';
  };

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider">
            {t('nav_memories')}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight">
            {t('memories_page_title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            {language === 'ta'
              ? 'பள்ளி நினைவுகள், சிறப்பு புகைப்படங்கள் மற்றும் சிறந்த சாதனை மாணவர்களின் விவரங்கள்.'
              : 'Cherished school memories, heritage photo archives, and academic rank holder achievements.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* ========================================================================= */}
        {/* SECTION 1: SCHOOL RANK HOLDERS & ACHIEVERS (REAL DATA - INITIAL 6 + LOAD MORE 3) */}
        {/* ========================================================================= */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-200">
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-[#854D0E]" />
                <span>{language === 'ta' ? 'நமது பள்ளி சாதனையாளர்கள்' : 'School Rank Holders & Achievers'}</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-bold text-[#111111]">
                {language === 'ta' ? 'கல்விச் சிறப்பும் விருதுகளும்' : 'Academic Excellence & Rank Holders'}
              </h2>
            </div>

            {/* Search & Academic Year / Batch Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'மாணவர் பெயர் தேட...' : 'Search student or rank...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#F4C542] bg-gray-50"
                />
              </div>

              {/* Year Dropdown Filter */}
              <div className="w-full sm:w-56">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full text-xs p-2 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#F4C542] font-semibold bg-gray-50 cursor-pointer"
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

          {/* Loading Indicator */}
          {loadingRankHolders ? (
            <div className="text-center py-16 text-gray-500 font-semibold text-sm">
              Loading Rank Holders from Database...
            </div>
          ) : filteredRankHolders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
              <Trophy className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">
                {language === 'ta' ? 'தேடலுக்கு ஏற்ப சாதனையாளர்கள் கிடைக்கவில்லை.' : 'No rank holders found in database matching your filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Premium Rank Holders Table View (No profile photos in table, simple corner (i) info button) */}
              <div className="bg-white border-2 border-[#111111] rounded-[28px] overflow-hidden shadow-[6px_6px_0px_0px_#111111]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#111111] border-collapse">
                    <thead className="bg-[#FFF7D6] border-b-2 border-[#111111] uppercase text-[11px] font-extrabold text-[#111111] tracking-wider">
                      <tr>
                        <th className="p-4 sm:p-5">Standard</th>
                        <th className="p-4 sm:p-5">Student / Alumni Name</th>
                        <th className="p-4 sm:p-5">Academic Year</th>
                        <th className="p-4 sm:p-5">Rank / Distinction</th>
                        <th className="p-4 sm:p-5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayedRankHolders.map((holder) => {
                        const badgeStyle = getRankBadgeStyle(holder.rank);

                        return (
                          <tr
                            key={holder.id}
                            onClick={() => setSelectedHolderModal(holder)}
                            className="hover:bg-amber-50/60 transition-colors cursor-pointer group"
                          >
                            {/* Standard / Class */}
                            <td className="p-4 sm:p-5 font-extrabold">
                              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] shadow-xs">
                                <Medal className="w-3.5 h-3.5 text-[#854D0E]" />
                                <span>{holder.class_standard.includes('Standard') ? holder.class_standard : `${holder.class_standard} Standard`}</span>
                              </span>
                            </td>

                            {/* Student Name */}
                            <td className="p-4 sm:p-5">
                              <div className="font-bold text-sm sm:text-base text-[#111111] group-hover:text-[#854D0E] transition-colors">
                                {holder.student_name}
                              </div>
                              {holder.achievement_title && (
                                <div className="text-xs text-gray-500 font-medium">{holder.achievement_title}</div>
                              )}
                            </td>

                            {/* Academic Year */}
                            <td className="p-4 sm:p-5 font-bold text-sm text-gray-700">
                              {holder.academic_year}
                            </td>

                            {/* Rank Badge */}
                            <td className="p-4 sm:p-5">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${badgeStyle}`}>
                                <Trophy className="w-3.5 h-3.5" />
                                <span>{holder.rank}</span>
                              </span>
                            </td>

                            {/* Corner (i) Info Icon Action */}
                            <td className="p-4 sm:p-5 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedHolderModal(holder);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#111111] text-gray-600 group-hover:text-[#F4C542] border border-gray-300 group-hover:border-[#111111] transition-all cursor-pointer shadow-xs"
                                title="View Achiever Details"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LOAD MORE BUTTON (+3 EXPANDS) */}
              {visibleCount < filteredRankHolders.length && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 3)}
                    className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_0px_#F4C542] hover:shadow-[6px_6px_0px_0px_#F4C542] transition-all cursor-pointer border border-[#F4C542]/40 transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 text-[#F4C542]" />
                    <span>
                      {language === 'ta'
                        ? `மேலும் சாதனையாளர்களைக் காட்டு (+3) (${filteredRankHolders.length - visibleCount} மீதம்)`
                        : `Load More Achievers (+3) (${filteredRankHolders.length - visibleCount} Remaining)`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SCHOOL MEMORIES & PHOTO WALL GALLERY (REAL DATA) */}
        {/* ========================================================================= */}
        <div className="space-y-8 pt-8 border-t border-gray-200">
          <div className="space-y-2">
            {/* <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-[#854D0E]" />
              <span>{language === 'ta' ? 'நினைவுகள் ஆல்பம்' : 'School Photo Wall & Archives'}</span>
            </span> */}

            <h2 className="text-2xl sm:text-4xl font-bold text-[#111111]">
              {language === 'ta' ? 'பள்ளி பருவ வரலாற்று படங்கள்' : 'Cherished Campus Photos & Reunions'}
            </h2>
          </div>

          {/* Photo Gallery Grid */}
          {loadingMemories ? (
            <div className="text-center py-12 text-gray-500 font-semibold text-sm">
              Loading Memories Gallery...
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">
                {language === 'ta' ? 'நினைவுகள் படங்கள் எதுவும் பதிவேற்றப்படவில்லை.' : 'No school memory photos found in database.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  onClick={() => setActivePhoto(memory)}
                  className="bg-white border-2 border-[#111111] rounded-[28px] overflow-hidden shadow-[5px_5px_0px_0px_#111111] hover:shadow-[8px_8px_0px_0px_#F4C542] transition-all duration-300 transform hover:-translate-x-1 hover:-translate-y-1 group cursor-pointer relative"
                >
                  <div className="h-60 overflow-hidden bg-gray-100 relative">
                    <img
                      src={getAssetUrl(memory.image_url)}
                      alt={memory.title || 'School Memory'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end z-10">
                      <h3 className="text-base font-bold text-[#F4C542] truncate">{memory.title || 'School Memory'}</h3>
                      <span className="text-xs text-gray-300 font-semibold">{t('uploaded_by')} {memory.uploader_name || 'Alumni Member'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Memory Callout */}
        <div className="bg-white border-2 border-[#111111] rounded-[32px] p-8 text-center space-y-4 shadow-[8px_8px_0px_0px_#111111] max-w-2xl mx-auto relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#111111]">
              {language === 'ta' ? 'பள்ளி பருவ புகைப்படங்கள் உள்ளதா?' : 'Have photos from your school days?'}
            </h3>
            <p className="text-sm text-gray-600 font-normal">
              {language === 'ta' ? 'உள்நுழைந்து உங்கள் நினைவுகளை பழைய வகுப்புத் தோழர்களுடன் பகிரவும்.' : 'Log in to your alumni account and share cherished memories with your batch cohort.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer"
            >
              <span>{t('share_memory_btn')}</span>
              <ArrowRight className="w-4 h-4 text-[#F4C542]" />
            </button>
          </div>
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

            {/* Modal Content */}
            <div className="space-y-4 pt-2">
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={getAssetUrl(selectedHolderModal.photograph) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedHolderModal.student_name)}&background=111111&color=ffffff`}
                  alt={selectedHolderModal.student_name}
                  className="w-full h-full object-cover rounded-full border-4 border-[#111111] shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#111111] text-[#F4C542] p-2 rounded-full shadow-lg border border-[#F4C542]">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border shadow-xs inline-flex items-center space-x-1.5 ${getRankBadgeStyle(selectedHolderModal.rank)}`}>
                  <Medal className="w-4 h-4" />
                  <span>{selectedHolderModal.class_standard.includes('Standard') ? selectedHolderModal.class_standard : `${selectedHolderModal.class_standard} Standard`}</span>
                </span>

                <h3 className="text-2xl font-bold text-[#111111] mt-3">
                  {selectedHolderModal.student_name}
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  Academic Year: {selectedHolderModal.academic_year} • {selectedHolderModal.rank}
                </p>
              </div>

              {/* Details Box */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left space-y-2">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-semibold">Exam / Achievement:</span>
                  <span className="font-bold text-[#111111]">{selectedHolderModal.achievement_type || 'SSLC / Public Examination'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-semibold">Marks / Score:</span>
                  <span className="font-bold text-emerald-700">{selectedHolderModal.marks_percentage || 'N/A'}</span>
                </div>
                {selectedHolderModal.subject_stream && (
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-semibold">Subject Stream:</span>
                    <span className="font-bold text-[#111111]">{selectedHolderModal.subject_stream}</span>
                  </div>
                )}
                {selectedHolderModal.description && (
                  <div className="pt-1 text-gray-600 leading-relaxed">
                    {selectedHolderModal.description}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHolderModal(null)}
              className="w-full py-3 bg-[#111111] text-[#F4C542] hover:bg-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Close Achiever Card
            </button>
          </div>
        </div>
      )}

      {/* PHOTO GALLERY LIGHTBOX MODAL */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border-2 border-[#F4C542]">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-[450px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={getAssetUrl(activePhoto.image_url)}
                alt={activePhoto.title || 'School Memory'}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#111111]">{activePhoto.title || 'School Memory'}</h3>
                <p className="text-xs text-gray-500">{t('uploaded_by')} {activePhoto.uploader_name || 'Alumni Member'}</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border border-[#F4C542]/40 cursor-pointer flex items-center space-x-1.5"
              >
                <span>{t('share_memory_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F4C542]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
