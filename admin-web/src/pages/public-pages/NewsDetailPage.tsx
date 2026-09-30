import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, FileText, Download, Printer, Share2, Sparkles,
  Megaphone, PartyPopper, BookOpen, Award, ExternalLink, Image as ImageIcon,
  CheckCircle2, Copy, Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import { LoadingState } from '../../components/EmptyState';
import type { Announcement } from '../../types';

const CATEGORY_MAP: Record<string, { labelEn: string; labelTa: string; icon: any; color: string }> = {
  GENERAL: { labelEn: 'Notice', labelTa: 'அறிவிப்பு', icon: Megaphone, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  CIRCULAR: { labelEn: 'Circular', labelTa: 'சுற்றறிக்கை', icon: FileText, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  EVENT_NOTICE: { labelEn: 'Event Notice', labelTa: 'நிகழ்வு', icon: Calendar, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  CELEBRATION: { labelEn: 'Celebration', labelTa: 'விழா / கொண்டாட்டம்', icon: PartyPopper, color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ACADEMIC: { labelEn: 'Academic', labelTa: 'கல்வி / தேர்வு', icon: BookOpen, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  ACHIEVEMENT: { labelEn: 'Achievement', labelTa: 'சாதனை', icon: Award, color: 'bg-orange-100 text-orange-900 border-orange-300' },
};

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [news, setNews] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'article' | 'pdf'>('article');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getPublicAnnouncements()
      .then((items) => {
        if (isMounted) {
          const found = (items || []).find((item: any) => item.id === id);
          setNews(found || null);
        }
      })
      .catch((err) => console.error('Failed to load news item:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <LoadingState />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {language === 'ta' ? 'அறிவிப்பு பெறப்படவில்லை' : 'Announcement Not Found'}
        </h2>
        <p className="text-sm text-gray-600 max-w-md">
          {language === 'ta'
            ? 'நீங்கள் தேடும் செய்தி அல்லது சுற்றறிக்கை அகற்றப்பட்டிருக்கலாம்.'
            : 'The announcement or circular you are looking for does not exist or may have been removed.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#111111] text-[#F4C542] rounded-xl font-bold text-xs shadow-md transition-all"
        >
          {language === 'ta' ? 'முகப்பு பக்கத்திற்கு திரும்பு' : 'Return to Home Page'}
        </button>
      </div>
    );
  }

  const cat = CATEGORY_MAP[news.category || 'GENERAL'] || CATEGORY_MAP.GENERAL;
  const CatIcon = cat.icon;

  const displayTitle = language === 'ta' && news.title_ta ? news.title_ta : news.title;
  const secondaryTitle =
    language === 'ta' && news.title_ta && news.title !== news.title_ta
      ? news.title
      : language !== 'ta' && news.title_ta
      ? news.title_ta
      : null;

  const displayContent = language === 'ta' && news.content_ta ? news.content_ta : news.content;
  const secondaryContent =
    language === 'ta' && news.content_ta && news.content !== news.content_ta
      ? news.content
      : language !== 'ta' && news.content_ta
      ? news.content_ta
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white font-sans">
      {/* Header Toolbar */}
      <div className="sticky top-0 z-30 bg-[#111827]/90 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#F4C542]" />
          <span>{language === 'ta' ? 'பின்செல்க' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          {news.pdf_url && (
            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                onClick={() => setActiveViewTab('article')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeViewTab === 'article'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'அறிக்கை' : 'Article'}
              </button>
              <button
                onClick={() => setActiveViewTab('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeViewTab === 'pdf'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'PDF சான்று' : 'PDF Viewer'}
              </button>
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700 cursor-pointer"
            title="Copy Public Page Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#F4C542]" />}
            <span className="hidden sm:inline">{copied ? 'Copied Link' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700 cursor-pointer"
            title="Print Announcement"
          >
            <Printer className="w-4 h-4 text-[#F4C542]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {news.pdf_url && (
            <a
              href={news.pdf_url}
              download={news.pdf_file_name || 'Circular.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] rounded-xl transition-all text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ta' ? 'பதிவிறக்கு' : 'Download PDF'}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Dedicated Page Canvas */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeViewTab === 'pdf' && news.pdf_url ? (
          <div className="bg-[#1F2937] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl space-y-2">
            <div className="px-5 py-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-[#F4C542] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {news.pdf_file_name || 'Official Circular Attachment PDF'}
              </span>
              <a
                href={news.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-300 hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>{language === 'ta' ? 'புதிய தாவலில் திற' : 'Open in New Tab'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src={`${news.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={displayTitle}
              className="w-full h-[80vh] border-0"
            />
          </div>
        ) : (
          <div className="bg-white text-gray-900 border border-gray-200 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8 animate-fadeIn font-sans">
            {/* Category & Date Header Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${cat.color}`}>
                  <CatIcon className="w-4 h-4" />
                  <span>{language === 'ta' ? cat.labelTa : cat.labelEn}</span>
                </span>
                {news.target && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 uppercase">
                    {news.target}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-3.5 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>{formatDateDDMMYYYY(news.created_at)}</span>
              </div>
            </div>

            {/* Poster Image Hero Banner if present */}
            {news.poster_url && (
              <div className="rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-lg flex items-center justify-center max-h-[500px]">
                <img
                  src={news.poster_url}
                  alt={displayTitle}
                  className="max-h-[500px] w-full object-contain"
                />
              </div>
            )}

            {/* Titles */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] leading-tight">
                {displayTitle}
              </h1>
              {secondaryTitle && (
                <p className="text-sm sm:text-base font-semibold text-amber-900/80 italic">
                  {secondaryTitle}
                </p>
              )}
            </div>

            {/* Main Content Body */}
            <div className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-normal border-y border-gray-100 py-6">
              {displayContent}
            </div>

            {/* Secondary Language Content Card if available */}
            {secondaryContent && (
              <div className="bg-[#FFFDF5] border border-amber-200 rounded-2xl p-6 text-xs sm:text-sm text-gray-800 space-y-2 shadow-2xs">
                <span className="font-extrabold text-[#854D0E] block uppercase tracking-wider text-[11px]">
                  {language === 'ta' ? 'ஆங்கில விவரம் (English Version)' : 'தமிழ் பதிப்பு (Tamil Version)'}
                </span>
                <p className="whitespace-pre-wrap leading-relaxed">{secondaryContent}</p>
              </div>
            )}

            {/* PDF Attachment Banner */}
            {news.pdf_url && (
              <div className="space-y-4 pt-2">
                <div className="bg-[#FFFDF5] border-2 border-amber-300/80 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-3 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111111] truncate">
                        {news.pdf_file_name || (language === 'ta' ? 'அதிகாரப்பூர்வ சுற்றறிக்கை PDF' : 'Official Circular PDF')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {news.pdf_file_size ? `${(news.pdf_file_size / (1024 * 1024)).toFixed(2)} MB · ` : ''}
                        Official Attachment Document
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveViewTab('pdf')}
                      className="px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      {language === 'ta' ? 'PDF பார்' : 'View PDF Document'}
                    </button>
                    <a
                      href={news.pdf_url}
                      download={news.pdf_file_name || 'Circular.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-white hover:bg-gray-50 text-[#111111] font-bold text-xs rounded-xl border border-gray-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-[#854D0E]" />
                      <span>{language === 'ta' ? 'பதிவிறக்கு' : 'Download'}</span>
                    </a>
                  </div>
                </div>

                {/* Inline PDF Preview Frame */}
                <div className="border border-gray-300 rounded-2xl overflow-hidden bg-gray-900 shadow-md">
                  <iframe
                    src={`${news.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    title={displayTitle}
                    className="w-full h-[600px] border-0 bg-[#1F2937]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
