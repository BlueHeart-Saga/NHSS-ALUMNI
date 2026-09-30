import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ExternalLink, Download, FileText, Maximize2, Minimize2, Sparkles,
  Printer, Calendar, Clock, Megaphone, PartyPopper, BookOpen, Award, Eye,
  CheckCircle2, Image as ImageIcon
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';
import type { Announcement } from '../types';

export interface NewsModalItem {
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
  created_by_name?: string;
}

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsModalItem | Announcement | null;
}

const CATEGORY_MAP: Record<string, { labelEn: string; labelTa: string; icon: any; color: string }> = {
  GENERAL: { labelEn: 'Notice', labelTa: 'அறிவிப்பு', icon: Megaphone, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  CIRCULAR: { labelEn: 'Circular', labelTa: 'சுற்றறிக்கை', icon: FileText, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  EVENT_NOTICE: { labelEn: 'Event Notice', labelTa: 'நிகழ்வு', icon: Calendar, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  CELEBRATION: { labelEn: 'Celebration', labelTa: 'விழா / கொண்டாட்டம்', icon: PartyPopper, color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ACADEMIC: { labelEn: 'Academic', labelTa: 'கல்வி / தேர்வு', icon: BookOpen, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  ACHIEVEMENT: { labelEn: 'Achievement', labelTa: 'சாதனை', icon: Award, color: 'bg-orange-100 text-orange-900 border-orange-300' },
};

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  isOpen,
  onClose,
  news,
}) => {
  const { language } = useLanguage();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'pdf'>('details');
  const [posterLightboxOpen, setPosterLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !news) return;

    // Reset default view
    setActiveTab('details');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (posterLightboxOpen) {
          setPosterLightboxOpen(false);
        } else if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onClose();
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, news, isFullScreen, posterLightboxOpen, onClose]);

  if (!isOpen || !news) return null;

  const cat = CATEGORY_MAP[news.category || 'GENERAL'] || CATEGORY_MAP.GENERAL;
  const CatIcon = cat.icon;

  const displayTitle = language === 'ta' && news.title_ta ? news.title_ta : news.title;
  const secondaryTitle = language === 'ta' && news.title_ta && news.title !== news.title_ta
    ? news.title
    : language !== 'ta' && news.title_ta
    ? news.title_ta
    : null;

  const displayContent = language === 'ta' && news.content_ta ? news.content_ta : news.content;
  const secondaryContent = language === 'ta' && news.content_ta && news.content !== news.content_ta
    ? news.content
    : language !== 'ta' && news.content_ta
    ? news.content_ta
    : null;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isFullScreen ? 'p-0 bg-black' : 'p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md'
      } animate-fadeIn`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#111827] text-white flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen
            ? 'w-screen h-screen rounded-none border-0'
            : 'w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-800 h-[92vh] max-h-[920px]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-3 sm:px-5 py-3 bg-[#1F2937] border-b border-gray-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-md">
          {/* Title & Category Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
              <CatIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-bold text-white truncate leading-tight">
                  {displayTitle}
                </h3>
                <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/20 text-[#F4C542] border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> {language === 'ta' ? cat.labelTa : cat.labelEn}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">
                {formatDateDDMMYYYY(news.created_at)}
                {news.created_by_name && ` · ${news.created_by_name}`}
              </p>
            </div>
          </div>

          {/* View Toggle Tabs if PDF is attached */}
          {news.pdf_url && (
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'அறிக்கை' : 'Details'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'PDF சான்று' : 'PDF View'}
              </button>
            </div>
          )}

          {/* Right Control Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 cursor-pointer active:scale-95"
              title="Print Announcement"
            >
              <Printer className="w-4 h-4 text-[#F4C542]" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Full Screen Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 cursor-pointer active:scale-95"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen View'}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-[#F4C542]" />
                  <span className="hidden lg:inline">Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-[#F4C542]" />
                  <span className="hidden lg:inline">Full Screen</span>
                </>
              )}
            </button>

            {/* Download PDF Button if present */}
            {news.pdf_url && (
              <a
                href={news.pdf_url}
                download={news.pdf_file_name || 'Circular.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 active:scale-95"
                title="Download PDF"
              >
                <Download className="w-4 h-4 text-[#F4C542]" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            {/* Premium Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer active:scale-95 border border-red-500/30 ml-1"
              title="Close Modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Canvas Body */}
        {activeTab === 'pdf' && news.pdf_url ? (
          <div className="flex-1 bg-[#0B0F17] relative overflow-hidden flex flex-col">
            <iframe
              src={`${news.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={displayTitle}
              className="w-full h-full border-0 bg-[#1F2937]"
            />
          </div>
        ) : (
          <div className="flex-1 bg-[#F9FAFB] text-[#111111] relative overflow-y-auto p-4 sm:p-8 space-y-6">
            <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 animate-fadeIn font-sans text-gray-900">
              {/* Poster Image Lightbox Frame */}
              {news.poster_url && (
                <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-md group max-h-96 flex items-center justify-center">
                  <img
                    src={news.poster_url}
                    alt={displayTitle}
                    className="max-h-96 w-full object-contain cursor-pointer group-hover:scale-102 transition-transform duration-300"
                    onClick={() => setPosterLightboxOpen(true)}
                  />
                  <div
                    onClick={() => setPosterLightboxOpen(true)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                  >
                    <span className="px-4 py-2 bg-black/80 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg">
                      <ImageIcon className="w-4 h-4 text-[#F4C542]" />
                      <span>{language === 'ta' ? 'சுவரொட்டி படத்தை பெரிதாக்குக' : 'Click to Expand Poster'}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Title & Metadata Header */}
              <div className="border-b border-gray-200 pb-5 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${cat.color}`}>
                    <CatIcon className="w-3.5 h-3.5 mr-1 inline" />
                    {language === 'ta' ? cat.labelTa : cat.labelEn}
                  </span>

                  <div className="flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                    <span>{formatDateDDMMYYYY(news.created_at)}</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-[#111111] leading-snug">
                  {displayTitle}
                </h1>

                {secondaryTitle && (
                  <p className="text-xs sm:text-sm font-semibold text-amber-900/80 italic">
                    {secondaryTitle}
                  </p>
                )}
              </div>

              {/* Primary Content Text */}
              <div className="text-sm sm:text-base leading-relaxed text-gray-800 font-normal whitespace-pre-wrap">
                {displayContent}
              </div>

              {/* Secondary Language Content Box if available */}
              {secondaryContent && (
                <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-5 text-xs sm:text-sm text-gray-800 space-y-1.5 shadow-2xs">
                  <span className="font-extrabold text-[#854D0E] block uppercase tracking-wider text-[11px]">
                    {language === 'ta' ? 'ஆங்கில விவரம் (English Version)' : 'தமிழ் பதிப்பு (Tamil Version)'}
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{secondaryContent}</p>
                </div>
              )}

              {/* PDF Document Attachment Card & Embedded Viewer */}
              {news.pdf_url && (
                <div className="space-y-4 pt-2">
                  <div className="bg-[#FFFDF5] border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2.5 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#111111] truncate">
                          {news.pdf_file_name || (language === 'ta' ? 'அதிகாரப்பூர்வ சுற்றறிக்கை PDF' : 'Official Circular PDF')}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {news.pdf_file_size ? `${(news.pdf_file_size / (1024 * 1024)).toFixed(2)} MB · ` : ''}
                          Official Attachment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab('pdf')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{language === 'ta' ? 'முழுத்திரை PDF பார்' : 'Open Full PDF View'}</span>
                      </button>

                      <a
                        href={news.pdf_url}
                        download={news.pdf_file_name || 'Circular.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-[#111111] font-bold text-xs rounded-xl border border-gray-300 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#854D0E]" />
                        <span>{language === 'ta' ? 'பதிவிறக்கு' : 'Download'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded Inline PDF Frame inside the Details View */}
                  <div className="border border-gray-300 rounded-2xl overflow-hidden bg-gray-900 shadow-md">
                    <div className="bg-[#1F2937] px-4 py-2.5 border-b border-gray-700 flex items-center justify-between text-xs text-white">
                      <span className="font-bold flex items-center gap-1.5 text-[#F4C542]">
                        <FileText className="w-4 h-4" />
                        {language === 'ta' ? 'இணைக்கப்பட்ட PDF ஆவணம்' : 'Attached PDF Document Preview'}
                      </span>
                      <a
                        href={news.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <span>{language === 'ta' ? 'புதிய தாவலில் திற' : 'Open in New Tab'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <iframe
                      src={`${news.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                      title={displayTitle}
                      className="w-full h-[520px] border-0 bg-[#1F2937]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Poster Image Full-Screen Lightbox Overlay */}
      {posterLightboxOpen && news.poster_url && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setPosterLightboxOpen(false);
          }}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setPosterLightboxOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 p-2 rounded-xl bg-gray-800/80 cursor-pointer transition-all border border-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={news.poster_url}
              alt={displayTitle}
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-gray-800"
            />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
