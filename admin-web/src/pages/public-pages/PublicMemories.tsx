import React, { useEffect, useState } from 'react';
import { Search, Award, User, X, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';
import { RankHolder } from '../../types';
import { PublicMemoriesShowcase } from './components/PublicMemoriesShowcase';

export const PublicMemories: React.FC = () => {
  const { t, language } = useLanguage();
  const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
  const [loadingRankHolders, setLoadingRankHolders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedHolderModal, setSelectedHolderModal] = useState<RankHolder | null>(null);
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api.getPublicRankHolders()
      .then((r) => setRankHolders(r || []))
      .catch(() => setRankHolders([]))
      .finally(() => setLoadingRankHolders(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear]);

  const uniqueYears = Array.from(new Set(rankHolders.map((h) => h.academic_year))).sort().reverse();
  const filteredRankHolders = rankHolders.filter((h) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      h.student_name.toLowerCase().includes(q) ||
      h.rank.toLowerCase().includes(q) ||
      (h.achievement_title && h.achievement_title.toLowerCase().includes(q));
    return matchesSearch && (!selectedYear || h.academic_year === selectedYear);
  });

  const totalFiltered = filteredRankHolders.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const displayedRankHolders = filteredRankHolders.slice(startIndex, endIndex);

  const renderClassStandard = (value?: string) => {
    const standard = value || '10th Standard';
    const m = standard.match(/^(\d+)(st|nd|rd|th)(.*)$/i);
    if (!m) return standard;
    return <>{m[1]}<sup className="text-[0.65em] leading-none">{m[2]}</sup>{m[3]}</>;
  };

  /** Simple clean count number for S.NO */
  const renderRankBadge = (position: number) => {
    const n = startIndex + position;
    return (
      <span className="font-bold text-sm text-[#05070A]">
        {n}
      </span>
    );
  };

  return (
    <div className="bg-[#FFFDF7] text-[#111111] animate-fadeIn font-sans min-h-screen">
      {/* ══════════════════════════════════════════════════════════════════
          GRAND HERO — ALUMNI MEMORY WALL
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF5] via-[#FFF6DA] to-[#FFFDF7] border-b border-[#E7C968]/50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#F4C542]/25 blur-3xl" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#F4C542]/25 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center justify-center gap-5 sm:gap-10">
            {/* Left laurel */}
            <svg viewBox="0 0 60 90" className="w-12 h-16 sm:w-16 sm:h-24 shrink-0 text-[#C89211]" aria-hidden>
              <path d="M50 8 C 28 12, 12 34, 10 58 C 9 70, 14 80, 22 86 C 20 74, 22 62, 30 52 C 38 42, 46 34, 50 22 C 52 16, 52 12, 50 8 Z" fill="currentColor" opacity="0.9" />
              <path d="M42 20 C 26 22, 14 40, 14 60 C 14 72, 20 82, 28 86" stroke="#8A5A00" strokeWidth="1.2" fill="none" opacity="0.6" />
            </svg>

            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#0B0F14] leading-[1.05]">
                {language === 'ta' ? 'நினைவுச் சுவர்' : 'ALUMNI MEMORY WALL'}
              </h1>
              <p className="text-xs sm:text-base text-[#4B5563] max-w-2xl mx-auto font-medium leading-relaxed">
                {language === 'ta'
                  ? 'பள்ளி நினைவுகள், சிறப்பு புகைப்படங்கள், வீடியோக்கள் மற்றும் சிறந்த சாதனை மாணவர்களின் விவரங்கள்.'
                  : 'Cherished school photo albums, celebration videos, heritage archives, and academic rank holder achievements.'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="h-[1px] w-10 bg-[#D4A017]" />
                <span className="inline-block w-2 h-2 rotate-45 bg-[#C89211] shadow-[0_0_8px_rgba(200,146,17,0.8)]" />
                <span className="h-[1px] w-10 bg-[#D4A017]" />
              </div>
            </div>

            {/* Right laurel */}
            <svg viewBox="0 0 60 90" className="w-12 h-16 sm:w-16 sm:h-24 shrink-0 text-[#C89211] -scale-x-100" aria-hidden>
              <path d="M50 8 C 28 12, 12 34, 10 58 C 9 70, 14 80, 22 86 C 20 74, 22 62, 30 52 C 38 42, 46 34, 50 22 C 52 16, 52 12, 50 8 Z" fill="currentColor" opacity="0.9" />
              <path d="M42 20 C 26 22, 14 40, 14 60 C 14 72, 20 82, 28 86" stroke="#8A5A00" strokeWidth="1.2" fill="none" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* ──────────────────────────────────────────────────────────────
            Academic Excellence & Rank Holders — Grand Leaderboard
        ────────────────────────────────────────────────────────────── */}
        <div className="space-y-8 sm:space-y-10">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-4">
              <span
                className="inline-flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#4A3300] px-4 py-1.5 rounded-full border border-[#B58900]/70"
                style={{
                  background: 'linear-gradient(180deg, #FFF3B8 0%, #F4C542 55%, #D4A017 100%)',
                  boxShadow: '0 3px 10px rgba(180,140,0,0.4), inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
              >
                <Trophy className="w-4 h-4 text-[#4A3300]" />
                <span>
                  {language === 'ta'
                    ? '🏆 பள்ளி சாதனையாளர்கள் & வெற்றியாளர்கள்'
                    : '🏆 SCHOOL RANK HOLDERS & ACHIEVERS'}
                </span>
              </span>

              <h2 className="text-3xl sm:text-[42px] lg:text-[48px] font-black text-[#0B0F14] tracking-tight leading-[1.05]">
                {language === 'ta' ? 'கல்விச் சிறப்பும் விருதுகளும்' : 'Academic Excellence & Rank Holders'}
              </h2>

              <div
                className="h-[3px] w-40 rounded-full"
                style={{ background: 'linear-gradient(90deg, #F4C542, #D4A017 60%, transparent)' }}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#854D0E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'மாணவர் பெயர் தேட...' : 'Search student or rank...'}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#E7DFC8] rounded-full focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#F4C542]/30 font-medium shadow-xs transition-all"
                />
              </div>
              <div className="w-full sm:w-56">
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs px-4 py-2.5 bg-white border border-[#E7DFC8] rounded-full focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#F4C542]/30 font-semibold cursor-pointer shadow-xs transition-all"
                >
                  <option value="">
                    {language === 'ta' ? 'அனைத்து ஆண்டுகள் (All Years)' : 'All Academic Years'}
                  </option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>Academic Year: {year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loadingRankHolders ? (
            <div className="text-center py-16 text-gray-500 font-semibold text-sm">
              Loading Rank Holders...
            </div>
          ) : displayedRankHolders.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto space-y-2 p-6">
              <Award className="w-10 h-10 text-[#854D0E] mx-auto opacity-70" />
              <h4 className="font-bold text-sm text-[#111111]">
                {language === 'ta' ? 'சாதனையாளர்கள் பட்டியல் எதுவும் பதிவேற்றப்படவில்லை' : 'No Rank Holders Added Yet'}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                Academic achievers will appear here once published by the school administration.
              </p>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════
               THE AWARD BOARD — gilded table with corner flourishes
            ═══════════════════════════════════════════════════════════ */
            <div className="relative">
              {/* Gold corner flourishes */}
              <svg className="pointer-events-none absolute -top-3 -left-3 w-16 h-16 text-[#D4A017]" viewBox="0 0 60 60" aria-hidden>
                <path d="M4 32 C 4 16, 16 4, 32 4 M4 40 C 4 20, 20 4, 40 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <svg className="pointer-events-none absolute -top-3 -right-3 w-16 h-16 text-[#D4A017] -scale-x-100" viewBox="0 0 60 60" aria-hidden>
                <path d="M4 32 C 4 16, 16 4, 32 4 M4 40 C 4 20, 20 4, 40 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <svg className="pointer-events-none absolute -bottom-3 -left-3 w-16 h-16 text-[#D4A017] -scale-y-100" viewBox="0 0 60 60" aria-hidden>
                <path d="M4 32 C 4 16, 16 4, 32 4 M4 40 C 4 20, 20 4, 40 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <svg className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-[#D4A017] -scale-x-100 -scale-y-100" viewBox="0 0 60 60" aria-hidden>
                <path d="M4 32 C 4 16, 16 4, 32 4 M4 40 C 4 20, 20 4, 40 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>

              {/* Gilded frame with inner card */}
              <div
                className="relative rounded-[28px] p-[4px]"
                style={{
                  background:
                    'linear-gradient(135deg, #F7E27A 0%, #D4A017 30%, #8A5A00 50%, #D4A017 70%, #F7E27A 100%)',
                  boxShadow:
                    '0 30px 70px rgba(133,77,14,0.3), 0 10px 25px rgba(133,77,14,0.18)',
                }}
              >
                <div className="rounded-[25px] bg-white overflow-hidden">
                  {/* Crown strip above the header — subtle ornamental band */}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, #F4C542 15%, #D4A017 50%, #F4C542 85%, transparent 100%)',
                    }}
                  />

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[940px] text-left border-collapse text-xs">
                      <colgroup>
                        <col style={{ width: '9%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '16%' }} />
                      </colgroup>

                      {/* Dark gradient header with gold text + gold bottom line */}
                      <thead>
                        <tr
                          className="text-[#F4C542] uppercase text-[11px] font-black tracking-[0.2em]"
                          style={{
                            background:
                              'linear-gradient(180deg, #232A38 0%, #0B0F14 45%, #05070A 100%)',
                          }}
                        >
                          <th className="py-5 px-4 text-center border-b-[3px] border-[#D4A017]">S.NO</th>
                          <th className="py-5 px-4 border-b-[3px] border-[#D4A017]">
                            {language === 'ta' ? 'மாணவர் பெயர்' : 'STUDENT NAME'}
                          </th>
                          <th className="py-5 px-4 text-center border-b-[3px] border-[#D4A017]">
                            {language === 'ta' ? 'கல்வியாண்டு' : 'ACADEMIC YEAR'}
                          </th>
                          <th className="py-5 px-4 text-center border-b-[3px] border-[#D4A017]">
                            {language === 'ta' ? 'வகுப்பு' : 'CLASS / STANDARD'}
                          </th>
                          <th className="py-5 px-4 text-center border-b-[3px] border-[#D4A017]">
                            {language === 'ta' ? 'பெற்ற மதிப்பெண்கள்' : 'MARKS SECURED'}
                          </th>
                          <th className="py-5 px-4 text-center border-b-[3px] border-[#D4A017]">
                            {language === 'ta' ? 'சதவீதம்' : 'PERCENTAGE'}
                          </th>
                        </tr>
                      </thead>

                      <tbody className="font-medium">
                        {displayedRankHolders.map((holder, index) => (
                          <tr
                            key={holder.id}
                            onClick={() => setSelectedHolderModal(holder)}
                            className={`${
                              index % 2 === 0 ? 'bg-white' : 'bg-[#FFF7DC]'
                            } border-b border-[#F1E3AE] last:border-b-0 hover:bg-[#FFF1BF] transition-colors cursor-pointer group`}
                          >
                            <td className="py-5 px-4 text-center">
                              {renderRankBadge(index + 1)}
                            </td>

                            <td className="py-5 px-4">
                              <p className="font-black text-[16px] sm:text-[17px] text-[#05070A] tracking-tight">
                                {language === 'ta' && holder.student_name_ta
                                  ? holder.student_name_ta
                                  : holder.student_name}
                              </p>
                            </td>

                            <td className="py-5 px-4 text-center">
                              <span
                                className="inline-block px-4 py-1.5 rounded-full font-bold text-[#4A3300] text-[12px] border border-[#D4A017]"
                                style={{
                                  background: 'linear-gradient(180deg, #FFF7D6 0%, #F4C542 65%, #D4A017 100%)',
                                  boxShadow: '0 3px 8px rgba(180,140,0,0.35), inset 0 1px 0 rgba(255,255,255,0.7)',
                                }}
                              >
                                {holder.academic_year}
                              </span>
                            </td>

                            <td className="py-5 px-4 text-center text-xs font-bold text-[#334155]">
                              {renderClassStandard(holder.class_standard)}
                            </td>

                            <td className="py-5 px-4 text-center">
                              {holder.total_marks ? (
                                <span className="whitespace-nowrap">
                                  <strong className="text-[18px] font-black text-[#05070A]">
                                    {holder.total_marks}
                                  </strong>
                                  <span className="text-[12px] text-[#B0B7C3] font-medium">
                                    {' '}
                                    / {holder.max_marks || (Number(holder.total_marks) > 500 ? '1200' : '500')}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs font-normal">N/A</span>
                              )}
                            </td>

                            <td className="py-5 px-4 text-center">
                              <span
                                className="inline-block min-w-[72px] px-4 py-2 rounded-full font-black text-[13px] text-[#2B1D00] border border-[#B58900]"
                                style={{
                                  background: 'linear-gradient(180deg, #FFE58A 0%, #F4C542 55%, #C89211 100%)',
                                  boxShadow: '0 4px 12px rgba(200,146,17,0.45), inset 0 1px 0 rgba(255,255,255,0.75)',
                                }}
                              >
                                {holder.marks_percentage || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalFiltered > 0 && totalPages > 1 && (
                    <div className="px-5 sm:px-7 py-4 bg-[#FFF9E2] border-t border-[#F1E3AE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
                      <span className="text-center sm:text-left font-medium">
                        {language === 'ta' ? (
                          <>
                            மொத்தம் <strong className="text-[#05070A]">{totalFiltered}</strong> இல்{' '}
                            <strong className="text-[#05070A]">{startIndex + 1}</strong> –{' '}
                            <strong className="text-[#05070A]">{Math.min(endIndex, totalFiltered)}</strong>{' '}
                            காட்டப்படுகிறது
                          </>
                        ) : (
                          <>
                            Showing{' '}
                            <strong className="text-[#05070A]">{startIndex + 1}</strong> –{' '}
                            <strong className="text-[#05070A]">{Math.min(endIndex, totalFiltered)}</strong>{' '}
                            of <strong className="text-[#05070A]">{totalFiltered}</strong> entries
                          </>
                        )}
                      </span>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={safeCurrentPage === 1}
                          className="w-10 h-10 rounded-full border border-[#D4A017] bg-white text-[#854D0E] hover:bg-[#FFF7D6] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer shadow-xs flex items-center justify-center"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span
                          className="px-4 py-2 rounded-full font-black text-[#4A3300] border border-[#D4A017] text-xs whitespace-nowrap"
                          style={{
                            background: 'linear-gradient(180deg, #FFF7D6 0%, #F1D68A 100%)',
                            boxShadow: '0 3px 8px rgba(180,140,0,0.3), inset 0 1px 0 rgba(255,255,255,0.7)',
                          }}
                        >
                          {language === 'ta'
                            ? `பக்கம் ${safeCurrentPage} / ${totalPages}`
                            : `Page ${safeCurrentPage} of ${totalPages}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safeCurrentPage === totalPages}
                          className="w-10 h-10 rounded-full border border-[#D4A017] bg-white text-[#854D0E] hover:bg-[#FFF7D6] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer shadow-xs flex items-center justify-center"
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Memories showcase — untouched */}
        <div className="pt-6 border-t border-gray-200">
          <PublicMemoriesShowcase />
        </div>
      </div>

      {/* Achiever detail modal — same fields, matching styles */}
      {selectedHolderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-[#E7C968] overflow-hidden p-6 text-center space-y-6">
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
              <h3 className="text-2xl font-bold text-[#0B0F14]">{selectedHolderModal.student_name}</h3>
              <p className="text-xs text-[#854D0E] font-semibold">
                {selectedHolderModal.achievement_title || 'School Academic Rank Holder'}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Academic Year:</span>
                <span className="font-bold text-[#0B0F14]">{selectedHolderModal.academic_year}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Class / Standard:</span>
                <span className="font-bold text-[#0B0F14]">{selectedHolderModal.class_standard || '10th Standard'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Exam / Achievement:</span>
                <span className="font-bold text-[#0B0F14]">{selectedHolderModal.achievement_type || 'SSLC / Public Examination'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Marks / Score:</span>
                <span className="font-bold text-emerald-700">{selectedHolderModal.marks_percentage || 'N/A'}</span>
              </div>
              {selectedHolderModal.description && (
                <div className="pt-1 text-gray-600 leading-relaxed">{selectedHolderModal.description}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};