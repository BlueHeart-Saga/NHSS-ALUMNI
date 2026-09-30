import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Video, FileText, Download, Printer, Copy,
  Check, ExternalLink, Sparkles, ShieldCheck
} from 'lucide-react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { formatDateDDMMYYYY } from '../../../utils/dateUtils';
import { LoadingState } from '../../../components/EmptyState';
import type { MeetingMinute } from '../../../types';

export const MeetingMinuteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [meeting, setMeeting] = useState<MeetingMinute | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'document' | 'pdf'>('document');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getPublicMeetingMinutes()
      .then((items) => {
        if (isMounted) {
          const found = (items || []).find((m: MeetingMinute) => m.id === id);
          setMeeting(found || null);
          if (found?.pdf_url) {
            setActiveViewTab('pdf');
          }
        }
      })
      .catch((err) => console.error('Failed to load meeting minute:', err))
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

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {language === 'ta' ? 'கூட்டத் தீர்மானம் பெறப்படவில்லை' : 'Meeting Resolution Not Found'}
        </h2>
        <p className="text-sm text-gray-600 max-w-md">
          {language === 'ta'
            ? 'நீங்கள் தேடும் கூட்ட அறிக்கை பெறப்படவில்லை அல்லது அகற்றப்பட்டிருக்கலாம்.'
            : 'The meeting minute resolution record you are looking for does not exist.'}
        </p>
        <button
          onClick={() => navigate('/audit')}
          className="px-5 py-2.5 bg-[#111111] text-[#F4C542] rounded-xl font-bold text-xs shadow-md transition-all"
        >
          {language === 'ta' ? 'ஆடிட் பக்கத்திற்கு திரும்பு' : 'Return to Financial Audit'}
        </button>
      </div>
    );
  }

  const displayTitle = language === 'ta' && meeting.title_ta ? meeting.title_ta : meeting.title;
  const notesText = language === 'ta' && meeting.notes_ta ? meeting.notes_ta : meeting.notes || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white font-sans">
      {/* Top Header Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#111827]/90 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/audit')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#F4C542]" />
          <span>{language === 'ta' ? 'ஆடிட் பக்கத்திற்கு செல்' : 'Back to Financial Audit'}</span>
        </button>

        <div className="flex items-center gap-2">
          {meeting.pdf_url && (
            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                onClick={() => setActiveViewTab('document')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeViewTab === 'document'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'அறிக்கை' : 'Document View'}
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
            title="Copy Public Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#F4C542]" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700 cursor-pointer"
            title="Print Resolutions Document"
          >
            <Printer className="w-4 h-4 text-[#F4C542]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {meeting.pdf_url && (
            <a
              href={meeting.pdf_url}
              download={meeting.pdf_file_name || 'Meeting_Minutes.pdf'}
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

      {/* Dedicated Page Main Canvas */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeViewTab === 'pdf' && meeting.pdf_url ? (
          <div className="bg-[#1F2937] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl space-y-2">
            <div className="px-5 py-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-[#F4C542] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {meeting.pdf_file_name || 'Signed Executive Resolutions PDF'}
              </span>
              <a
                href={meeting.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-300 hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>{language === 'ta' ? 'புதிய தாவலில் திற' : 'Open in New Tab'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src={`${meeting.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={displayTitle}
              className="w-full h-[80vh] border-0"
            />
          </div>
        ) : (
          <div className="bg-white text-gray-900 border border-gray-200 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8 animate-fadeIn font-sans">
            {/* Letterhead Header */}
            <div className="text-center pb-6 border-b-2 border-amber-500/80 space-y-2">
              <div className="inline-flex p-3 bg-[#FFF7D6] rounded-2xl border border-[#F4C542] text-[#854D0E] mb-1">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#111111] uppercase tracking-wide">
                நடராஜன் மேல்நிலைப்பள்ளி (NHSS)
              </h1>
              <h2 className="text-base sm:text-lg font-extrabold text-[#854D0E]">
                {language === 'ta'
                  ? 'முன்னாள் மாணவர்கள் சங்கம் — நிர்வாகிகள் கூட்டம்'
                  : 'Alumni Association — Executive Committee Meeting'}
              </h2>
              <p className="text-sm sm:text-base font-bold text-gray-800 bg-amber-50 border border-amber-200 px-5 py-2 rounded-full inline-block mt-1">
                {displayTitle}
              </p>
            </div>

            {/* Metadata Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FFFDF5] border border-amber-200 p-4 rounded-2xl text-center text-xs">
              <div className="flex items-center justify-center space-x-2 font-bold text-gray-800">
                <Calendar className="w-4 h-4 text-[#854D0E]" />
                <span>{formatDateDDMMYYYY(meeting.meeting_date)}</span>
              </div>
              {meeting.meeting_time && (
                <div className="flex items-center justify-center space-x-2 font-bold text-gray-800">
                  <Clock className="w-4 h-4 text-[#854D0E]" />
                  <span>{meeting.meeting_time}</span>
                </div>
              )}
              {meeting.meeting_type && (
                <div className="flex items-center justify-center space-x-2 font-bold text-gray-800">
                  <Video className="w-4 h-4 text-[#854D0E]" />
                  <span>{meeting.meeting_type}</span>
                </div>
              )}
            </div>

            {/* Passed Resolutions Body */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-gray-800 font-medium">
              <h3 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{language === 'ta' ? 'நிறைவேற்றப்பட்ட தீர்மானங்கள்' : 'Passed Resolutions & Record'}</span>
              </h3>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 whitespace-pre-wrap leading-relaxed shadow-xs">
                {notesText}
              </div>
            </div>

            {/* PDF Attachment Preview Container if exists */}
            {meeting.pdf_url && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="bg-[#FFFDF5] border-2 border-amber-300/80 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-3 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111111] truncate">
                        {meeting.pdf_file_name || (language === 'ta' ? 'கூட்ட தீர்மானங்கள் PDF' : 'Meeting Resolution PDF')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {meeting.pdf_file_size ? `${(meeting.pdf_file_size / (1024 * 1024)).toFixed(2)} MB · ` : ''}
                        Signed Official Document
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
                      href={meeting.pdf_url}
                      download={meeting.pdf_file_name || 'Meeting_Minutes.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-white hover:bg-gray-50 text-[#111111] font-bold text-xs rounded-xl border border-gray-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-[#854D0E]" />
                      <span>{language === 'ta' ? 'பதிவிறக்கு' : 'Download'}</span>
                    </a>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-2xl overflow-hidden bg-gray-900 shadow-md">
                  <iframe
                    src={`${meeting.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    title={displayTitle}
                    className="w-full h-[600px] border-0 bg-[#1F2937]"
                  />
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {language === 'ta' ? 'அதிகாரப்பூர்வமாக நிறைவேற்றப்பட்ட தீர்மானங்கள்' : 'Officially Passed Governance Record'}
              </span>
              <span className="font-bold text-[#854D0E]">NHSS Alumni Association</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
