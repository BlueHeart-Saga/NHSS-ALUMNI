import React, { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { EventItem } from '../../types';
import { useNavigate } from 'react-router-dom';

export const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Events & Get-Togethers</h2>
          <p className="text-xs text-[#6B7280]">School reunions, batch get-togethers, and attendance rosters</p>
        </div>

        <Button onClick={() => navigate('/school-admin/events/create')}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Get-Together
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No Get-Togethers Scheduled"
          description="No get-togethers are scheduled yet. Click the button above to create one."
          action={
            <Button onClick={() => navigate('/school-admin/events/create')}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Reunion
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => navigate(`/school-admin/events/${ev.id}`)}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs hover:border-[#F4C542] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542]/60 px-2.5 py-0.5 rounded-full">
                    {ev.batch_name || 'School-wide'}
                  </span>
                  <Badge status={ev.status} />
                </div>

                <h3 className="font-bold text-[#111111] text-lg leading-snug mb-2">{ev.title}</h3>
                <p className="text-xs text-[#6B7280] line-clamp-2 mb-4">{ev.description}</p>

                <div className="space-y-2 text-xs text-[#111111]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{ev.event_date} ({ev.start_time} - {ev.end_time})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] mt-6 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111] flex items-center">
                  <Users className="w-4 h-4 mr-1 text-[#854D0E]" />
                  {ev.attending_count} Confirmed
                </span>
                <span className="text-xs text-[#6B7280]">
                  Max Cap: {ev.max_capacity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
