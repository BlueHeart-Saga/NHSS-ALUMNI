import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { api } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import type { AuditStatementDetail } from '../../../types';
import { PdfViewer } from './components/PdfViewer';
import { AuditDetailsPanel } from './components/AuditDetailsPanel';
import { LoadingState } from '../../../components/EmptyState';
import { alertService } from '../../../services/alertService';

export const AuditDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [statement, setStatement] = useState<AuditStatementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    api.getPublicAuditStatementDetail(id)
      .then((data) => { if (mounted) setStatement(data); })
      .catch((err) => {
        console.error(err);
        alertService.handleApiError(err, 'Unable to load audit statement.');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto p-6"><LoadingState /></div>;
  if (!statement) return null;

  const displayTitle = language === 'ta' && statement.title_ta ? statement.title_ta : statement.title;

  const handleDownload = () => {
    if (!statement.pdf_url) return;
    const a = document.createElement('a');
    a.href = statement.pdf_url;
    a.download = statement.pdf_file_name || 'audit-statement.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-7 animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#111111] leading-tight">
              {displayTitle}
            </h1>
          </div>

          {statement.pdf_url && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.97] cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{t('audit_download_pdf')}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/audit')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('audit_back_to_audit')}</span>
        </button>

        {/* PDF + Details two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-8">
            <PdfViewer pdfUrl={statement.pdf_url} />
          </div>
          <div className="lg:col-span-4">
            <AuditDetailsPanel statement={statement} />
          </div>
        </div>

      </div>
    </div>
  );
};