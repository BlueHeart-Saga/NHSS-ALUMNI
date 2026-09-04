import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, UserCheck, Download, Edit3 } from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/EmptyState';
import { QRScannerModal } from '../../components/QRScannerModal';
import { api } from '../../services/api';
import { EventItem, AttendanceDashboard } from '../../types';

export const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [eventItem, setEventItem] = useState<EventItem | null>(null);
  const [dashboard, setDashboard] = useState<AttendanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (eventId) loadDetails();
  }, [eventId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [eData, dData] = await Promise.all([
        api.getEventDetails(eventId!),
        api.getAttendanceDashboard(eventId!)
      ]);
      setEventItem(eData);
      setDashboard(dData);
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!eventItem) return <div className="p-8">Event not found.</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <button
        onClick={() => navigate('/school-admin/events')}
        className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Events
      </button>

      {/* Hero Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-3 py-1 rounded-full">
              {eventItem.batch_name || 'School-wide Event'}
            </span>
            <Badge status={eventItem.status} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111111]">{eventItem.title}</h2>
          <p className="text-sm text-[#6B7280] mt-1 max-w-2xl">{eventItem.description}</p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-xs font-semibold text-[#111111]">
            <span>📅 {eventItem.event_date} ({eventItem.start_time} - {eventItem.end_time})</span>
            <span>📍 {eventItem.venue} ({eventItem.address})</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => navigate(`/school-admin/events/${eventId}/edit`)} className="w-full sm:w-auto justify-center">
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit Event
          </Button>
          <Button onClick={() => setIsQRModalOpen(true)} className="w-full sm:w-auto justify-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Open QR Check-in Terminal
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/school-admin/events/${eventId}/attendance`)} className="w-full sm:w-auto justify-center">
            <UserCheck className="w-4 h-4 mr-1.5" />
            View Attendance Roster
          </Button>
          <a
            href={api.getAttendanceCSVExportUrl(eventId!)}
            download
            className="inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-gray-50 text-[#111111] font-semibold text-sm rounded-xl border border-[#E5E7EB] w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Real-time RSVP Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Confirmed Alumni"
          value={dashboard?.confirmed_alumni || 0}
          subtitle="RSVP Attending"
          icon={Users}
        />
        <StatsCard
          title="Maybe RSVP"
          value={dashboard?.maybe_alumni || 0}
          subtitle="Tentative attendees"
          icon={Users}
        />
        <StatsCard
          title="Total Adult Guests"
          value={dashboard?.total_adult_guests || 0}
          subtitle="Spouses / Adults"
          icon={Users}
        />
        <StatsCard
          title="Total Child Guests"
          value={dashboard?.total_child_guests || 0}
          subtitle="Children count"
          icon={Users}
        />
        <StatsCard
          title="Total Expected People"
          value={dashboard?.total_expected_people || 0}
          subtitle={`Checked in: ${dashboard?.checked_in_count || 0}`}
          icon={CheckCircle2}
        />
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        eventId={eventId!}
        onSuccessCheckin={loadDetails}
      />
    </div>
  );
};
