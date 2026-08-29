import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { Table } from '../../components/Table';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { AttendanceRosterItem } from '../../types';

export const AttendanceRoster: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [roster, setRoster] = useState<AttendanceRosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) fetchRoster();
  }, [eventId]);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const data = await api.getAttendanceRoster(eventId!);
      setRoster(data);
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Alumnus',
      accessor: (row: AttendanceRosterItem) => (
        <div>
          <div className="font-bold text-[#111111]">{row.full_name}</div>
          <div className="text-xs text-[#6B7280]">Batch {row.passing_year} • Adm: {row.admission_number}</div>
        </div>
      )
    },
    {
      header: 'RSVP Status',
      accessor: (row: AttendanceRosterItem) => <Badge status={row.rsvp_status} />
    },
    {
      header: 'Guest Breakdown',
      accessor: (row: AttendanceRosterItem) => (
        <div className="text-xs">
          <div>Adults: <strong className="text-[#111111]">{row.adults_count}</strong> | Kids: <strong className="text-[#111111]">{row.children_count}</strong></div>
          <div className="text-[#854D0E] font-semibold">Total expected: {row.total_guests}</div>
        </div>
      )
    },
    {
      header: 'Venue Check-in',
      accessor: (row: AttendanceRosterItem) => (
        row.is_checked_in ? (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Checked In ({row.checked_in_at})
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Not Checked In</span>
        )
      )
    }
  ];

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={() => navigate(`/school-admin/events/${eventId}`)}
        className="inline-flex items-center text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Event Details
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Event Attendance Roster</h2>
          <p className="text-xs text-[#6B7280]">Detailed list of alumni RSVPs, guest counts, and check-in logs</p>
        </div>

        <a
          href={api.getAttendanceCSVExportUrl(eventId!)}
          download
          className="inline-flex items-center px-4 py-2.5 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-semibold text-sm rounded-xl border border-[#F4C542]"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Attendance CSV
        </a>
      </div>

      <Table columns={columns} data={roster} keyExtractor={(r) => r.alumni_id} />
    </div>
  );
};
