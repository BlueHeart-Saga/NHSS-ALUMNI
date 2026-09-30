import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Download, FileText, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string | null;
  fileName?: string | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  fileName,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Prevent background body scrolling & handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    setIframeLoading(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
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
  }, [isOpen, isFullScreen, onClose]);

  if (!isOpen || !pdfUrl) return null;

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
            : 'w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-800 h-[90vh] max-h-[900px]'
        }`}
      >
        {/* Responsive Header Bar */}
        <div className="px-3 sm:px-5 py-3 bg-[#1F2937] border-b border-gray-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-md">
          {/* Title & File Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-[#F4C542] rounded-xl text-[#111111] shrink-0 shadow-xs">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white truncate leading-tight">
                  {title}
                </h3>
                <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/20 text-[#F4C542] border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Official Document
                </span>
              </div>
              {fileName && (
                <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">
                  {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
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

            {/* Download Button */}
            <a
              href={pdfUrl}
              download={fileName || 'Document.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 active:scale-95"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-[#F4C542]" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Open in New Tab Button */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5 border border-gray-700/80 active:scale-95"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open Tab</span>
            </a>

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

        {/* PDF Viewer Canvas Body */}
        <div className="flex-1 bg-[#0B0F17] relative overflow-hidden flex flex-col">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0B0F17] text-gray-300 space-y-3">
              <div className="w-8 h-8 border-3 border-[#F4C542] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-gray-400">Loading document viewer...</p>
            </div>
          )}

          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            title={title}
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0 bg-[#1F2937]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};
