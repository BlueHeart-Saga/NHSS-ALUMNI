import React, { useEffect, useState } from 'react';
import { Users, UserCheck, GraduationCap, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { DashboardReport, AlumniProfile, EventItem } from '../../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [pendingList, setPendingList] = useState<AlumniProfile[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [repData, pendData, evData] = await Promise.all([
        api.getDashboardReport(),
        api.getPendingVerifications(),
        api.getEvents()
      ]);
      setReport(repData);
      setPendingList(pendData.slice(0, 5));
      if (evData.length > 0) setUpcomingEvent(evData[0]);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuick = async (alumniId: string) => {
    try {
      await api.verifyAlumni(alumniId, 'APPROVED', 'Quick approved from dashboard');
      alertService.showSuccess('Alumni Approved', 'Alumni registration application has been approved.');
      loadDashboardData();
    } catch (err: any) {
      alertService.handleApiError(err, 'Quick approval failed.');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Alumni"
          value={report?.total_alumni || 0}
          subtitle="Configured school registry"
          icon={Users}
        />
        <StatsCard
          title="Verified Alumni"
          value={report?.verified_alumni || 0}
          subtitle="Approved active members"
          icon={UserCheck}
        />
        <StatsCard
          title="Pending Applications"
          value={report?.pending_alumni || 0}
          subtitle="Awaiting admin review"
          icon={UserCheck}
        />
        <StatsCard
          title="Active Cohorts"
          value={report?.active_batches || 0}
          subtitle="2005 - 2025 Batches"
          icon={GraduationCap}
        />
        <StatsCard
          title="Turnout Rate"
          value={`${report?.attendance_turnout_percentage || 0}%`}
          subtitle="Event check-in ratio"
          icon={Calendar}
        />
      </div>

      {/* Hero Upcoming Event Banner */}
      {upcomingEvent && (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF7D6] rounded-full blur-3xl -z-10"></div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/60 text-[#854D0E] px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span>FEATURED GET-TOGETHER REUNION</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">{upcomingEvent.title}</h2>
            <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">{upcomingEvent.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-[#111111]">
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                📅 {upcomingEvent.event_date} ({upcomingEvent.start_time})
              </span>
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl">
                📍 {upcomingEvent.venue}
              </span>
              <span className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl text-[#854D0E]">
                👥 {upcomingEvent.attending_count} Confirmed ({upcomingEvent.total_guests} total guests)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button onClick={() => navigate(`/school-admin/events/${upcomingEvent.id}`)}>
              View RSVP Roster
            </Button>
          </div>
        </div>
      )}

      {/* Pending Applications Review Widget */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-[#111111]">Pending Alumni Verification Queue</h3>
            <p className="text-xs text-[#6B7280]">Recent applications requiring school admin verification</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/school-admin/verification')}>
            <span>View All ({report?.pending_alumni || 0})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {pendingList.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#6B7280]">
            ✓ No pending applications requiring review!
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {pendingList.map((a) => (
              <div key={a.id} className="py-3.5 flex items-center justify-between hover:bg-[#FAFAFA] px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <img src={a.profile_photo_url} alt="" className="w-10 h-10 rounded-full border border-[#E5E7EB] object-cover" />
                  <div>
                    <div className="text-sm font-bold text-[#111111]">{a.full_name}</div>
                    <div className="text-xs text-[#6B7280]">
                      Batch {a.passing_year} • Adm No: {a.admission_number} • {a.mobile}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge status={a.verification_status} />
                  <Button size="sm" onClick={() => handleApproveQuick(a.id)}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
