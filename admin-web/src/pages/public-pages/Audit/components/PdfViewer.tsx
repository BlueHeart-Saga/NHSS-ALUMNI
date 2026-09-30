import React, { useState } from 'react';
import { FileText, Maximize2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { PdfViewerModal } from '../../../../components/PdfViewerModal';

interface Props {
  pdfUrl?: string | null;
  title?: string;
  fileName?: string;
}

export const PdfViewer: React.FC<Props> = ({ pdfUrl, title = 'Audit Statement PDF', fileName }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[#111111] rounded-2xl overflow-hidden border border-[#374151] shadow-lg">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#1F2937] border-b border-[#374151]">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-[#9CA3AF] uppercase tracking-wider ml-2">
              Interactive PDF Viewer
            </span>
          </div>

          {pdfUrl && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-[#F4C542] rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 border border-gray-700 cursor-pointer"
                title="Full Screen Cover View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen Cover View</span>
              </button>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            title={title}
            className="w-full bg-[#374151]"
            style={{ height: 'min(78vh, 820px)' }}
          />
        ) : (
          <div className="p-12 text-center bg-[#FAFAFA]">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-xs text-gray-500">{t('audit_pdf_unavailable')}</p>
          </div>
        )}
      </div>

      {/* Full Screen View Modal */}
      <PdfViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        pdfUrl={pdfUrl}
        fileName={fileName}
      />
    </>
  );
};