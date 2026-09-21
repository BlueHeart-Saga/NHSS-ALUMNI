import React from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { alertService } from '../../../../services/alertService';
import type { AuditStatementDetail } from '../../../../types';

interface Props {
  statement: AuditStatementDetail;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
};

export const AuditDetailsPanel: React.FC<Props> = ({ statement }) => {
  const { t, language } = useLanguage();
  const displayTitle = language === 'ta' && statement.title_ta ? statement.title_ta : statement.title;
  const pdfUrl = statement.pdf_url?.trim();

  const handleViewPdf = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!pdfUrl) {
      event.preventDefault();
      alertService.showError('Unable to open PDF', 'The PDF URL is not available for this audit statement.');
      return;
    }

    try {
      const resolvedUrl = new URL(pdfUrl, window.location.origin);
      if (!['http:', 'https:'].includes(resolvedUrl.protocol)) {
        throw new Error('Unsupported PDF URL protocol');
      }
    } catch (error) {
      event.preventDefault();
      console.error('[AuditDetailsPanel] invalid PDF URL:', error);
      alertService.showError('Unable to open PDF', 'The uploaded PDF URL is invalid.');
    }
  };

  const rows: { label: string; value: string }[] = [
    { label: t('audit_label_title'), value: displayTitle },
    { label: t('audit_label_period'), value: `${statement.period_start} - ${statement.period_end}` },
    { label: t('audit_label_posted_on'), value: statement.posted_date || '—' },
    { label: t('audit_label_file_name'), value: statement.pdf_file_name || '—' },
    { label: t('audit_label_file_size'), value: formatFileSize(statement.pdf_file_size) },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-[#E5E7EB]">
        <div className="w-9 h-9 bg-[#FFF7D6] border border-[#F4C542]/50 rounded-xl flex items-center justify-center">
          <FileText className="w-4.5 h-4.5 text-[#854D0E]" strokeWidth={1.8} />
        </div>
        <h3 className="font-bold text-base text-[#111111]">{t('audit_details_title')}</h3>
      </div>

      <dl className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 text-xs sm:text-sm">
            <dt className="col-span-4 sm:col-span-3 font-semibold text-[#6B7280]">{row.label}</dt>
            <dd className="col-span-1 sm:col-span-1 font-semibold text-[#9CA3AF]">:</dd>
            <dd className="col-span-7 sm:col-span-8 text-[#111111] font-medium break-words">{row.value}</dd>
          </div>
        ))}
      </dl>

      {pdfUrl && (
        <div className="mt-6 space-y-2.5">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleViewPdf}
            className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 bg-[#FFF7D6] hover:bg-[#F4C542]/30 border border-[#F4C542]/60 text-[#854D0E] font-bold text-sm rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t('audit_view_pdf')}</span>
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('audit_download_pdf')}</span>
          </a>
        </div>
      )}
    </div>
  );
};