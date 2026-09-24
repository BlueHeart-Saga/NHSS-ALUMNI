import React, { useEffect, useState } from 'react';
import { ClipboardList, Calendar, Clock, Video, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../../../services/api';
import { useLanguage } from '../../../../context/LanguageContext';
import { LoadingState } from '../../../../components/EmptyState';
import type { MeetingMinute } from '../../../../types';

const MEETINGS_PER_PAGE = 5;

/** Format "YYYY-MM-DD" → "20 September 2026" */
const formatDate = (iso: string): string => {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
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

export const MeetingMinutesSection: React.FC = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getPublicMeetingMinutes()
      .then((data) => {
        if (mounted) {
          const sorted = data || [];
          setItems(sorted);
          // Auto expand the first meeting by default for instant visibility
          if (sorted.length > 0) {
            setExpandedId(sorted[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('[MeetingMinutesSection] fetch failed:', err);
        if (mounted) setItems([]);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

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

  const totalPages = Math.max(1, Math.ceil(items.length / MEETINGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * MEETINGS_PER_PAGE;
  const endIndex = startIndex + MEETINGS_PER_PAGE;
  const visible = items.slice(startIndex, endIndex);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-4">
      <SectionHeader language={language} />

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
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/70 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#854D0E]" />
                    {language === 'ta' ? 'அதிகாரப்பூர்வ கூட்டம்' : 'Official Minutes'}
                  </span>
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

              {/* ARTICLE TEXT CONTENT (Wikipedia Article Style - Inline Link at Text End) */}
              <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
                <div className="text-sm sm:text-base font-semibold text-[#111111] leading-relaxed whitespace-pre-wrap tracking-normal">
                  {!isExpanded ? (
                    <>
                      {preview}
                      {hasMoreText && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(m.id)}
                          className="font-extrabold text-[#854D0E] hover:text-[#B58900] hover:underline inline-flex items-center gap-1 ml-2 cursor-pointer text-sm sm:text-base bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
                        >
                          <span>{language === 'ta' ? '...மேலும் பார்க்க' : '...Read More'}</span>
                          <ArrowRight className="w-4 h-4 text-[#854D0E] inline shrink-0" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {notesText}
                      {hasMoreText && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(m.id)}
                          className="font-extrabold text-[#854D0E] hover:text-[#B58900] hover:underline inline-flex items-center gap-1 ml-2.5 cursor-pointer text-xs sm:text-sm bg-gray-100 px-2 py-0.5 rounded-lg border border-gray-200"
                        >
                          <span>[{language === 'ta' ? 'சுருக்கத்தைக் காட்டு ↑' : 'Show Less ↑'}]</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* PDF Link inside card when expanded */}
                {isExpanded && m.pdf_url && (
                  <div className="mt-4 pt-3 border-t border-dashed border-[#E5E7EB] flex justify-end">
                    <a
                      href={m.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      {language === 'ta' ? 'அதிகாரப்பூர்வ PDF அறிக்கை பதிவிறக்குக' : 'Download Official PDF Document'}
                    </a>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <span>
            {language === 'ta' ? (
              <>
                மொத்தம் <strong className="text-[#111111]">{items.length}</strong> கூட்டங்களில்{' '}
                <strong className="text-[#111111]">{startIndex + 1}</strong>–
                <strong className="text-[#111111]">{Math.min(endIndex, items.length)}</strong> காட்டப்படுகிறது
              </>
            ) : (
              <>
                Showing <strong className="text-[#111111]">{startIndex + 1}</strong>–
                <strong className="text-[#111111]">{Math.min(endIndex, items.length)}</strong> of{' '}
                <strong className="text-[#111111]">{items.length}</strong> meetings
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
    </section>
  );
};

/** Section header matching the existing Audit page heading style exactly. */
const SectionHeader: React.FC<{ language: string }> = ({ language }) => (
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-lg flex items-center justify-center shrink-0">
      <ClipboardList className="w-4 h-4 text-[#854D0E]" />
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