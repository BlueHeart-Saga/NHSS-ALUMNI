import React, { useEffect, useState } from 'react';
import { ClipboardList, ArrowRight, X, Calendar, Clock, Video, FileText } from 'lucide-react';
import { api } from '../../../../services/api';
import { useLanguage } from '../../../../context/LanguageContext';
import { Modal } from '../../../../components/Modal';
import { LoadingState, EmptyState } from '../../../../components/EmptyState';
import type { MeetingMinute } from '../../../../types';

const MEETINGS_PER_PAGE = 3;

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
const buildPreview = (notes?: string, maxLines = 4): string => {
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
  const [selected, setSelected] = useState<MeetingMinute | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getPublicMeetingMinutes()
      .then((data) => { if (mounted) setItems(data || []); })
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
    // Hide the section entirely when nothing is published — keeps the page clean.
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(items.length / MEETINGS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * MEETINGS_PER_PAGE;
  const endIndex = startIndex + MEETINGS_PER_PAGE;
  const visible = items.slice(startIndex, endIndex);

  return (
    <>
      <section className="space-y-4">
        <SectionHeader language={language} />

        <div className="space-y-4">
          {visible.map((m) => {
            const notesText = (language === 'ta' && m.notes_ta) ? m.notes_ta : m.notes;
            const preview = buildPreview(notesText);
            return (
              <article
                key={m.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 hover:border-[#F4C542] transition-colors shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#111111] leading-snug">
                      {language === 'ta' && m.title_ta ? m.title_ta : m.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-[#6B7280]">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                        {formatDate(m.meeting_date)}
                      </span>
                      {m.meeting_time && (
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#854D0E]" />
                          {m.meeting_time}
                        </span>
                      )}
                      {m.meeting_type && (
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Video className="w-3.5 h-3.5 text-[#854D0E]" />
                          {m.meeting_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {preview && (
                  <p className="mt-3 text-xs sm:text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {preview}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelected(m)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#854D0E] hover:text-[#B58900] transition-colors"
                  >
                    {language === 'ta' ? 'மேலும் பார்க்க' : 'View More'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
                className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                {language === 'ta' ? 'முன்' : 'Previous'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCurrentPage(n)}
                  className={
                    'min-w-[30px] px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ' +
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
                className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#111111] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                {language === 'ta' ? 'அடுத்து' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={
          language === 'ta'
            ? 'சங்க கூட்ட நடவடிக்கைகள் & தீர்மானங்கள்'
            : 'Association Meeting Minutes & Resolutions'
        }
      >
        {selected && (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <h3 className="text-lg font-extrabold text-[#111111]">
                {language === 'ta' && selected.title_ta ? selected.title_ta : selected.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#4B5563]">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                  {formatDate(selected.meeting_date)}
                </span>
                {selected.meeting_time && (
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#854D0E]" />
                    {selected.meeting_time}
                  </span>
                )}
                {selected.meeting_type && (
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <Video className="w-3.5 h-3.5 text-[#854D0E]" />
                    {selected.meeting_type}
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-[#F3F4F6] pt-4">
              <h4 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-3">
                {language === 'ta' ? 'கூட்டக் குறிப்புகள் / தீர்மானங்கள்' : 'Meeting Notes / Resolutions'}
              </h4>
              <div className="text-xs sm:text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">
                {((language === 'ta' && selected.notes_ta) ? selected.notes_ta : selected.notes) || (language === 'ta' ? 'வழங்கப்படவில்லை.' : 'Not provided.')}
              </div>
            </div>

            {selected.pdf_url && (
              <div className="border-t border-[#F3F4F6] pt-4 flex justify-end">
                <a
                  href={selected.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  {language === 'ta' ? 'PDF பார்க்க' : 'View PDF'}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
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