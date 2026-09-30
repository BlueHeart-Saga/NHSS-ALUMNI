import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ClipboardList, Calendar, Clock, Video, FileText, ArrowRight,
  Sparkles, Eye, Download, Search, CheckCircle2, ChevronDown, ChevronUp,
  Maximize2
} from 'lucide-react';
import { api } from '../../../../services/api';
import { useLanguage } from '../../../../context/LanguageContext';
import { LoadingState } from '../../../../components/EmptyState';
import { MeetingDocumentModal } from '../../../../components/MeetingDocumentModal';
import type { MeetingMinute } from '../../../../types';
import { formatDateDDMMYYYY } from '../../../../utils/dateUtils';

const MEETINGS_PER_PAGE = 5;

/** Format date → "DD-MM-YYYY" */
const formatDate = (iso: string): string => {
  return formatDateDDMMYYYY(iso);
};

/** Grab the first 3–4 non-empty lines from the notes field for the preview. */
const buildPreview = (notes?: string, maxLines = 3): string => {
  if (!notes) return '';
  const lines = notes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.slice(0, maxLines).join('\n');
};

/** Format byte size to readable MB string */
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const MeetingMinutesSection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [items, setItems] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Meeting Document Modal state
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingMinute | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getPublicMeetingMinutes()
      .then((data) => {
        if (mounted) {
          setItems(data || []);
        }
      })
      .catch((err) => {
        console.error('[MeetingMinutesSection] fetch failed:', err);
        if (mounted) setItems([]);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const meetingId = searchParams.get('meetingId');
    if (meetingId && items.length > 0) {
      const found = items.find(m => m.id === meetingId);
      if (found) {
        setSelectedMeeting(found);
        setIsDocumentModalOpen(true);
      }
    }
  }, [searchParams, items]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((m) => {
      const title = (m.title || '').toLowerCase();
      const titleTa = (m.title_ta || '').toLowerCase();
      const notes = (m.notes || '').toLowerCase();
      const notesTa = (m.notes_ta || '').toLowerCase();
      const mType = (m.meeting_type || '').toLowerCase();
      return (
        title.includes(q) ||
        titleTa.includes(q) ||
        notes.includes(q) ||
        notesTa.includes(q) ||
        mType.includes(q)
      );
    });
  }, [items, searchQuery]);

  if (loading) {
    return (
      <section className="space-y-4">
        <SectionHeader language={language} />
        <div className="bg-white border border-[#E5E7EB] rounded-2xl">
          <LoadingState />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / MEETINGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * MEETINGS_PER_PAGE;
  const endIndex = startIndex + MEETINGS_PER_PAGE;
  const visible = filteredItems.slice(startIndex, endIndex);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleOpenDocumentModal = (m: MeetingMinute) => {
    setSelectedMeeting(m);
    setIsDocumentModalOpen(true);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader language={language} />

        {/* Quick Search */}
        {items.length > 2 && (
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                language === 'ta'
                  ? 'தீர்மானங்கள் அல்லது கூட்டங்களைத் தேடுக...'
                  : 'Search minutes & resolutions...'
              }
              className="w-full bg-white border border-[#E5E7EB] focus:border-[#F4C542] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111111] focus:outline-none transition-all shadow-xs"
            />
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center space-y-2">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">
            {language === 'ta' ? 'தேடலுக்கு முடிவுகள் இல்லை' : 'No matching meeting records found'}
          </p>
          <p className="text-xs text-gray-500">
            {language === 'ta'
              ? 'வேறு சொற்களைப் பயன்படுத்தித் தேடிப் பார்க்கவும்'
              : 'Try searching with different keywords'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((m) => {
            const isExpanded = expandedId === m.id;
            const notesText = (language === 'ta' && m.notes_ta) ? m.notes_ta : (m.notes || '');
            const preview = buildPreview(notesText);
            const hasMoreText = notesText.trim().length > preview.trim().length;

            return (
              <article
                key={m.id}
                className={`bg-white border transition-all rounded-3xl p-6 sm:p-7 shadow-xs ${
                  isExpanded ? 'border-[#F4C542] ring-1 ring-[#F4C542]/50' : 'border-[#E5E7EB] hover:border-[#F4C542]'
                }`}
              >
                {/* Header Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/70 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#854D0E]" />
                        {language === 'ta' ? 'அதிகாரப்பூர்வ கூட்டம்' : 'Official Minutes'}
                      </span>

                      {m.pdf_url ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {language === 'ta' ? 'அதிகாரப்பூர்வ PDF இணைக்கப்பட்டது' : 'PDF Document Attached'}
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <FileText className="w-3 h-3 text-amber-700" />
                          {language === 'ta' ? 'அறிக்கை மற்றும் தீர்மானங்கள்' : 'Resolutions Record'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDocumentModal(m)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFDF5] hover:bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/80 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>
                        {m.pdf_url
                          ? (language === 'ta' ? 'PDF / அறிக்கை பார்வையிடுக' : 'View PDF / Document')
                          : (language === 'ta' ? 'முழு அறிக்கை பார்வையிடுக' : 'View Official Document')}
                      </span>
                    </button>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] leading-snug">
                    {language === 'ta' && m.title_ta ? m.title_ta : m.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#6B7280]">
                    <span className="inline-flex items-center gap-1.5 font-bold bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 rounded-lg text-[#111111]">
                      <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                      {formatDate(m.meeting_date)}
                    </span>
                    {m.meeting_time && (
                      <span className="inline-flex items-center gap-1.5 font-bold bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 rounded-lg text-[#111111]">
                        <Clock className="w-3.5 h-3.5 text-[#854D0E]" />
                        {m.meeting_time}
                      </span>
                    )}
                    {m.meeting_type && (
                      <span className="inline-flex items-center gap-1.5 font-bold bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 rounded-lg text-[#111111]">
                        <Video className="w-3.5 h-3.5 text-[#854D0E]" />
                        {m.meeting_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* ARTICLE TEXT CONTENT */}
                <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
                  <div className="text-sm sm:text-base font-medium text-[#111111] leading-relaxed whitespace-pre-wrap tracking-normal">
                    {!isExpanded ? (
                      <>
                        {preview}
                        {hasMoreText && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(m.id)}
                            className="font-extrabold text-[#854D0E]"
                          >
                            <span>{language === 'ta' ? '...மேலும் பார்க்க' : '...Read Full Resolutions'}</span>
                            <ArrowRight className="w-4 h-4 text-[#854D0E] inline shrink-0" />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {notesText}
                        {hasMoreText && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => toggleExpand(m.id)}
                              className="font-bold text-[#854D0E] hover:bg-amber-100 inline-flex items-center gap-1 cursor-pointer text-xs bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition-all"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>{language === 'ta' ? 'சுருக்கத்தைக் காட்டு' : 'Show Less'}</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Document Action Bar inside card when expanded */}
                  <div className="mt-5 pt-4 border-t border-dashed border-[#E5E7EB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFDF5] p-4 rounded-2xl border border-amber-100">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-[#F4C542]/20 rounded-xl text-[#854D0E] shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111111] truncate">
                          {m.pdf_file_name || (language === 'ta' ? 'அதிகாரப்பூர்வ தீர்மானங்கள் அறிக்கை' : 'Official Resolutions Document')}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {m.pdf_file_size ? formatFileSize(m.pdf_file_size) + ' · ' : ''}
                          {m.pdf_url ? 'PDF Document' : 'Official Document Record'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        to={`/meeting-minutes/${m.id}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#F4C542]" />
                        {language === 'ta' ? 'தனப் பக்கத்தில் திற' : 'Open Page View'}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenDocumentModal(m)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4 text-[#111111]" />
                        {language === 'ta' ? 'முழுத் திரை அறிக்கை' : 'Full Screen Modal'}
                      </button>

                      {m.pdf_url && (
                        <a
                          href={m.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={m.pdf_file_name || 'MeetingMinutes.pdf'}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#111111] font-bold text-xs rounded-xl border border-[#E5E7EB] shadow-2xs transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-[#854D0E]" />
                          {language === 'ta' ? 'பதிவிறக்குக' : 'Download PDF'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <span>
            {language === 'ta' ? (
              <>
                மொத்தம் <strong className="text-[#111111]">{filteredItems.length}</strong> கூட்டங்களில்{' '}
                <strong className="text-[#111111]">{startIndex + 1}</strong>–
                <strong className="text-[#111111]">{Math.min(endIndex, filteredItems.length)}</strong> காட்டப்படுகிறது
              </>
            ) : (
              <>
                Showing <strong className="text-[#111111]">{startIndex + 1}</strong>–
                <strong className="text-[#111111]">{Math.min(endIndex, filteredItems.length)}</strong> of{' '}
                <strong className="text-[#111111]">{filteredItems.length}</strong> meetings
              </>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
            >
              {language === 'ta' ? 'முன்' : 'Previous'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCurrentPage(n)}
                className={
                  'min-w-[30px] px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ' +
                  (n === safePage
                    ? 'bg-[#F4C542] border-[#F4C542] text-[#111111]'
                    : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#F4C542]')
                }
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
            >
              {language === 'ta' ? 'அடுத்து' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Meeting Document & PDF Cover Modal */}
      <MeetingDocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        meeting={selectedMeeting}
      />
    </section>
  );
};

/** Section header matching the existing Audit page heading style exactly. */
const SectionHeader: React.FC<{ language: string }> = ({ language }) => (
  <div className="flex items-center space-x-3">
    <div className="w-9 h-9 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center shrink-0">
      <ClipboardList className="w-5 h-5 text-[#854D0E]" />
    </div>
    <div className="min-w-0">
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#111111] leading-tight">
        {language === 'ta'
          ? 'சங்க கூட்ட நடவடிக்கைகள் & தீர்மானங்கள்'
          : 'Association Meeting Minutes & Resolutions'}
      </h2>
      <p className="text-xs text-[#6B7280] mt-0.5">
        {language === 'ta'
          ? 'NHSS முன்னாள் மாணவர் சங்கத்தின் அதிகாரப்பூர்வ கூட்டப் பதிவுகள் மற்றும் தீர்மானங்கள்'
          : 'Official meeting records and resolutions of the NHSS Alumni Association'}
      </p>
    </div>
  </div>
);