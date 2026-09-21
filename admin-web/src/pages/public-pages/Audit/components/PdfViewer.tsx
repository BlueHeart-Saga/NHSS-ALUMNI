import React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  pdfUrl?: string | null;
}

export const PdfViewer: React.FC<Props> = ({ pdfUrl }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#111111] rounded-2xl overflow-hidden border border-[#374151] shadow-lg">
      {/* Faux-browser header — matches reference screenshot */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1F2937] border-b border-[#374151]">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        </div>
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
          PDF Viewer
        </span>
      </div>

      {pdfUrl ? (
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          title="Audit PDF"
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
  );
};