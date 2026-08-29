import React, { useEffect, useState } from 'react';
import { Download, BarChart3, Users, CheckCircle2, Calendar } from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { DashboardReport } from '../../types';

export const ReportsDashboard: React.FC = () => {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardReport().then(setReport).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-[#111111]">Reports & Data Export</h2>
        <p className="text-xs text-[#6B7280]">Aggregate stats, turnout metrics, and downloadable CSV reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Alumni Registry" value={report?.total_alumni || 0} icon={Users} />
        <StatsCard title="Verified Active Alumni" value={report?.verified_alumni || 0} icon={Users} />
        <StatsCard title="Completed Check-ins" value={report?.recent_checkins_count || 0} icon={CheckCircle2} />
        <StatsCard title="Turnout Rate" value={`${report?.attendance_turnout_percentage || 0}%`} icon={BarChart3} />
      </div>

      {/* CSV Export Center */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-[#111111]">CSV Roster & Analytics Export Center</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#111111] text-base">Full Alumni Roster CSV</h4>
              <p className="text-xs text-[#6B7280] mt-1">Export all alumni contact details, admission numbers, and statuses</p>
            </div>
            <a
              href={api.getAlumniCSVExportUrl()}
              download
              className="inline-flex items-center px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-sm rounded-xl border border-[#F4C542]"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export Roster
            </a>
          </div>

          <div className="p-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#111111] text-base">Get-Together Attendance Report</h4>
              <p className="text-xs text-[#6B7280] mt-1">Export event RSVP lists, guest counts, and check-in times</p>
            </div>
            <Button variant="secondary" onClick={() => alertService.showInfo('Select Event to Export', 'Please navigate to the Events Management tab and select a specific event to download its detailed attendance CSV report.')}>
              Select Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
