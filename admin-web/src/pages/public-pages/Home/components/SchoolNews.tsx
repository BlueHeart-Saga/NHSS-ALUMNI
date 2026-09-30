import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, ArrowRight, Newspaper, Clock, FileText, Megaphone,
  PartyPopper, BookOpen, Award, Eye, Download, CheckCircle2, X,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { formatDateDDMMYYYY } from '../../../../utils/dateUtils';
import { PdfViewerModal } from '../../../../components/PdfViewerModal';
import { NewsSkeleton } from './SkeletonLoaders';

export interface NewsItem {
  id: string;
  title: string;
  title_ta?: string;
  content: string;
  content_ta?: string;
  poster_url?: string;
  pdf_url?: string;
  pdf_file_name?: string;
  pdf_file_size?: number;
  category?: string;
  created_at: string;
}

interface SchoolNewsProps {
  announcements: NewsItem[];
  loading?: boolean;
  onSelectNews: (item: NewsItem) => void;
}

const INITIAL_LIMIT = 6;

const CATEGORY_MAP: Record<string, { labelEn: string; labelTa: string; icon: any; color: string }> = {
  GENERAL: { labelEn: 'Notice', labelTa: 'அறிவிப்பு', icon: Megaphone, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  CIRCULAR: { labelEn: 'Circular', labelTa: 'சுற்றறிக்கை', icon: FileText, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  EVENT_NOTICE: { labelEn: 'Event Notice', labelTa: 'நிகழ்வு', icon: Calendar, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  CELEBRATION: { labelEn: 'Celebration', labelTa: 'விழா / கொண்டாட்டம்', icon: PartyPopper, color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ACADEMIC: { labelEn: 'Academic', labelTa: 'கல்வி / தேர்வு', icon: BookOpen, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  ACHIEVEMENT: { labelEn: 'Achievement', labelTa: 'சாதனை', icon: Award, color: 'bg-orange-100 text-orange-900 border-orange-300' },
};

export const SchoolNews: React.FC<SchoolNewsProps> = ({ announcements, loading, onSelectNews }) => {
  const { language } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);

  // PDF Viewer Modal state
  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    fileName?: string;
  }>({
    isOpen: false,
    url: '',
    title: '',
    fileName: '',
  });

  // Image Lightbox state
  const [imageLightboxUrl, setImageLightboxUrl] = useState<string | null>(null);

  const getCategoryInfo = (cat?: string) => {
    return CATEGORY_MAP[cat || 'GENERAL'] || CATEGORY_MAP.GENERAL;
  };

  const openPdfViewer = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNews(item);
  };

  const visibleAnnouncements = announcements.slice(0, visibleCount);
  const hasMore = visibleCount < announcements.length;

  return (
    <section id="school-news" className="py-12 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {language === 'ta' ? 'செய்திகள் மற்றும் புதிய அறிவிப்புகள்' : 'School News & Official Updates'}
          </h2>
        </div>

        {loading ? (
          <NewsSkeleton />
        ) : announcements.length === 0 ? (
          /* Empty State Placeholder when news data is 0 */
          <div className="max-w-2xl mx-auto text-center py-12 px-6 sm:px-12 bg-gradient-to-b from-[#FFFDF5] to-white border-2 border-dashed border-[#F4C542]/70 rounded-3xl shadow-xs space-y-5 animate-fadeIn">
            {/* Ambient Icon with Pulse Dot */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] shadow-xs transform hover:scale-105 transition-transform">
                <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F4C542] border-2 border-white"></span>
              </span>
            </div>

            {/* Status Pill Badge */}
            <div>
              <span className="inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#854D0E] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#854D0E]" />
                <span>
                  {language === 'ta' ? 'புதிய தகவல்கள் விரைவில் வெளியாகும்' : 'Official Updates Coming Soon'}
                </span>
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#111111]">
                {language === 'ta'
                  ? ' செய்திகள் விரைவில் பகிரப்படும்'
                  : 'School Updates Will Be Published Soon'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                {language === 'ta'
                  ? 'முக்கிய நிகழ்வுகள், தேர்வு அறிவிப்புகள், சாதனைகள் மற்றும் சுற்றறிக்கைகள் விரைவில் இங்கு பதிவேற்றப்படும். தொடர்ந்து இணைந்திருங்கள்!'
                  : 'Important school circulars, exam notifications, upcoming celebrations, and student achievements will be posted here soon. Stay tuned!'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleAnnouncements.map((item) => {
                const cat = getCategoryInfo(item.category);
                const CatIcon = cat.icon;
                
                // Resolve Title & Content based on active language
                const displayTitle = language === 'ta' 
                  ? (item.title_ta || item.title) 
                  : item.title;
                
                const subtitle = language === 'ta' && item.title_ta && item.title !== item.title_ta
                  ? item.title
                  : !language.startsWith('ta') && item.title_ta
                  ? item.title_ta
                  : null;

                const displayContent = language === 'ta'
                  ? (item.content_ta || item.content)
                  : item.content;

                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between group"
                  >
                    {/* Top Poster Flyer Image (If available) */}
                    {item.poster_url ? (
                      <div 
                        className="relative aspect-[16/9] w-full bg-gray-900 overflow-hidden cursor-pointer"
                        onClick={() => onSelectNews(item)}
                      >
                        <img
                          src={item.poster_url}
                          alt={displayTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                        
                        {/* Top floating category pill */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-md inline-flex items-center space-x-1 ${cat.color}`}>
                            <CatIcon className="w-3 h-3 mr-1 inline" />
                            <span>{language === 'ta' ? cat.labelTa : cat.labelEn}</span>
                          </span>

                          {item.pdf_url && (
                            <span className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md inline-flex items-center gap-1 border border-blue-400">
                              <FileText className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Clean Branded Header when no poster flyer */
                      <div className="h-24 bg-gradient-to-r from-amber-50 via-[#FFFDF5] to-amber-100/60 p-4 border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#F4C542] flex items-center justify-center text-[#854D0E] shadow-2xs">
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                            {language === 'ta' ? cat.labelTa : cat.labelEn}
                          </span>
                        </div>
                        {item.pdf_url ? (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-700" />
                            PDF Attached
                          </span>
                        ) : (
                          <Newspaper className="w-6 h-6 text-amber-400/40" />
                        )}
                      </div>
                    )}

                    {/* Body Content Area */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Date Badge */}
                        <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full w-fit border border-[#F4C542]/60">
                          <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                          <span>{formatDateDDMMYYYY(item.created_at)}</span>
                        </div>

                        {/* Main Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                          {displayTitle}
                        </h3>

                        {/* Secondary Subtitle if bilingual */}
                        {subtitle && (
                          <p className="text-xs font-medium text-amber-900/80 line-clamp-1 italic">
                            {subtitle}
                          </p>
                        )}

                        {/* Content Excerpt */}
                        <p
                          className={`text-xs sm:text-sm text-gray-600 font-normal leading-relaxed ${
                            item.pdf_url ? 'line-clamp-3' : 'line-clamp-5 sm:line-clamp-6'
                          }`}
                        >
                          {displayContent}
                        </p>
                      </div>

                      {/* PDF Document Attachment Card if available */}
                      {item.pdf_url && (
                        <div className="bg-[#FFFDF5] border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="p-2 bg-[#F4C542]/20 rounded-xl text-[#854D0E] shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#111111] truncate">
                                {item.pdf_file_name || (language === 'ta' ? 'அதிகாரப்பூர்வ சுற்றறிக்கை PDF' : 'Official Circular PDF')}
                              </p>
                              {item.pdf_file_size && (
                                <p className="text-[10px] text-gray-500">
                                  {(item.pdf_file_size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => openPdfViewer(item, e)}
                            className="px-3 py-1.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'ta' ? 'பார்வையிடுக' : 'View PDF'}</span>
                          </button>
                        </div>
                      )}

                      {/* Footer Button */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          to={`/news/${item.id}`}
                          onClick={(e) => {
                            // If parent provided custom handler that sets modal, allow default link or call onSelectNews
                            onSelectNews(item);
                          }}
                          className="inline-flex items-center space-x-2 text-xs font-bold text-[#111111] group-hover:text-[#854D0E] uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          <span>{language === 'ta' ? 'முழு விவரம் படிக்க' : 'Read Full Announcement'}</span>
                          <ArrowRight className="w-4 h-4 text-[#854D0E] group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {item.pdf_url && (
                          <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={item.pdf_file_name || 'Circular.pdf'}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-[#854D0E] hover:bg-[#FFF7D6] rounded-xl transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More / View All Button */}
            {announcements.length > INITIAL_LIMIT && (
              <div className="mt-10 text-center">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-[#F4C542] hover:from-amber-600 hover:to-[#E0B030] text-[#111111] font-extrabold text-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95"
                  >
                    <span>
                      {language === 'ta'
                        ? `மேலும் செய்திகள் பார்க்க (${announcements.length - visibleCount} உள்ளது)`
                        : `View More News & Updates (${announcements.length - visibleCount} remaining)`}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(INITIAL_LIMIT)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#4B5563] font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <span>{language === 'ta' ? 'சுருக்கத்தைக் காட்டு' : 'Show Less'}</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF View Modal */}
      <PdfViewerModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal((prev) => ({ ...prev, isOpen: false }))}
        title={pdfModal.title}
        pdfUrl={pdfModal.url}
        fileName={pdfModal.fileName}
      />

      {/* Fullscreen Image Lightbox */}
      {imageLightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setImageLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={imageLightboxUrl}
              alt="Fullscreen Preview"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </section>
  );
};
