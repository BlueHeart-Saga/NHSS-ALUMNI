import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Download, FileText, Maximize2, Minimize2, Sparkles, Printer, Calendar, Clock, Video, CheckCircle2 } from 'lucide-react';
import type { MeetingMinute } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';

interface MeetingDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingMinute | null;
}

export const MeetingDocumentModal: React.FC<MeetingDocumentModalProps> = ({
  isOpen,
  onClose,
  meeting,
}) => {
  const { language } = useLanguage();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'pdf'>('document');

  useEffect(() => {
    if (!isOpen || !meeting) return;
    // Default to PDF tab if pdf_url is present, otherwise document tab
    if (meeting.pdf_url) {
      setActiveTab('pdf');
    } else {
      setActiveTab('document');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) setIsFullScreen(false);
        else onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, meeting, isFullScreen, onClose]);

  if (!isOpen || !meeting) return null;

  const displayTitle = language === 'ta' && meeting.title_ta ? meeting.title_ta : meeting.title;
  const notesText = language === 'ta' && meeting.notes_ta ? meeting.notes_ta : meeting.notes || '';

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
          {/* Title & Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white truncate leading-tight">
                  {displayTitle}
                </h3>
                {/* <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/20 text-[#F4C542] border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Official Resolutions
                </span> */}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">
                {formatDateDDMMYYYY(meeting.meeting_date)}
                {meeting.meeting_time && ` · ${meeting.meeting_time}`}
                {meeting.meeting_type && ` · ${meeting.meeting_type}`}
              </p>
            </div>
          </div>

          {/* View Toggle Tabs if PDF exists */}
          {meeting.pdf_url && (
            <div className="hidden sm:flex bg-gray-900 p-1 rounded-xl border border-gray-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('document')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'document'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'அறிக்கை பார்வை' : 'Document View'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-[#F4C542] text-[#111111] shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {language === 'ta' ? 'PDF வடிவம்' : 'PDF Viewer'}
              </button>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 cursor-pointer active:scale-95"
              title="Print Document"
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

            {meeting.pdf_url && (
              <a
                href={meeting.pdf_url}
                download={meeting.pdf_file_name || 'Meeting_Minutes.pdf'}
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

        {/* Modal Body Canvas */}
        {activeTab === 'pdf' && meeting.pdf_url ? (
          <div className="flex-1 bg-[#0B0F17] relative overflow-hidden flex flex-col">
            <iframe
              src={`${meeting.pdf_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={displayTitle}
              className="w-full h-full border-0 bg-[#1F2937]"
            />
          </div>
        ) : (
          <div className="flex-1 bg-[#F9FAFB] text-[#111111] relative overflow-y-auto p-4 sm:p-8">
            {/* Styled Official Document Paper Template */}
            <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 animate-fadeIn font-sans text-gray-900">
              {/* Document Letterhead Header */}
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
                <p className="text-xs sm:text-sm font-bold text-gray-700 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full inline-block">
                  {displayTitle}
                </p>
              </div>

              {/* Metadata Summary Pill Row */}
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

              {/* Resolutions Text Content */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-800 font-medium">
                <div className="bg-white border border-gray-200 rounded-xl p-5 whitespace-pre-wrap leading-relaxed">
                  {notesText}
                </div>
              </div>

              {/* Document Footer Signature Disclaimer */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
                <span>
                  {language === 'ta'
                    ? 'அதிகாரப்பூர்வமாக நிறைவேற்றப்பட்ட தீர்மானங்கள்'
                    : 'Officially Passed Resolutions Record'}
                </span>
                <span className="font-bold text-[#854D0E]">NHSS Alumni Association</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
