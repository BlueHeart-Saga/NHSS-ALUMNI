import React, { useEffect, useState } from 'react';
import { Download, BarChart3, Users, CheckCircle2, Calendar } from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { LoadingState, StatsGridSkeleton } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { DashboardReport } from '../../types';
import { AlumniDataReportsModule } from '../common-pages/AlumniDataReportsModule';
import { useLanguage } from '../../context/LanguageContext';

export const ReportsDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardReport().then(setReport).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <StatsGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-[#111111]">{t('admin_reports_page_title')}</h2>
        <p className="text-xs text-[#6B7280]">{t('admin_reports_page_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title={t('admin_reports_stat_total')} value={report?.total_alumni || 0} icon={Users} />
        <StatsCard title={t('admin_reports_stat_verified')} value={report?.verified_alumni || 0} icon={Users} />
        <StatsCard title={t('admin_reports_stat_checkins')} value={report?.recent_checkins_count || 0} icon={CheckCircle2} />
        <StatsCard title={t('admin_reports_stat_turnout')} value={`${report?.attendance_turnout_percentage || 0}%`} icon={BarChart3} />
      </div>

      {/* CSV Export Center */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-[#111111]">{t('admin_reports_export_center_title')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 sm:p-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-[#111111] text-base">{t('admin_reports_export_roster_title')}</h4>
              <p className="text-xs text-[#6B7280] mt-1">{t('admin_reports_export_roster_desc')}</p>
            </div>
            <a
              href={api.getAlumniCSVExportUrl()}
              download
              className="inline-flex items-center justify-center px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-sm rounded-xl border border-[#F4C542] w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {t('admin_reports_export_roster_btn')}
            </a>
          </div>

          <div className="p-5 sm:p-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-[#111111] text-base">{t('admin_reports_export_attendance_title')}</h4>
              <p className="text-xs text-[#6B7280] mt-1">{t('admin_reports_export_attendance_desc')}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => alertService.showInfo(
                t('admin_reports_alert_select_event_title'),
                t('admin_reports_alert_select_event_body')
              )}
              className="w-full sm:w-auto"
            >
              {t('admin_reports_export_attendance_btn')}
            </Button>
          </div>
        </div>
      </div>

      {/* 2-in-1 ALUMNI DATA & VOLUNTEERS TABLE REPORT MODULE */}
      <div className="pt-4 border-t border-gray-200">
        <AlumniDataReportsModule />
      </div>
    </div>
  );
};