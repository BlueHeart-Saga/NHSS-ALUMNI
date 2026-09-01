import React, { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, Users, Trash2, ExternalLink, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState, EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { EventItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../../utils/asset';

export const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');

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

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation(); // prevent navigating to details
    const confirmed = await alertService.showConfirm(
      'Delete Event?',
      `Are you sure you want to delete "${title}"? All attendance records will be removed.`
    );
    if (confirmed) {
      try {
        await api.deleteEvent(id);
        alertService.showSuccess('Event Deleted', `"${title}" has been deleted.`);
        fetchEvents();
      } catch (err) {
        alertService.handleApiError(err, 'Failed to delete event.');
      }
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingEvents = events.filter(e => !e.event_date || e.event_date >= todayStr);
  const pastEvents = events.filter(e => e.event_date && e.event_date < todayStr);

  const displayedEvents = activeTab === 'UPCOMING' ? upcomingEvents : pastEvents;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111111]">Events & Get-Togethers</h2>
          <p className="text-xs text-[#6B7280]">School reunions, batch get-togethers, and attendance rosters</p>
        </div>

        <Button onClick={() => navigate('/school-admin/events/create')}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Get-Together
        </Button>
      </div>

      {/* Date-Based Category Tabs (Upcoming vs Past Events) */}
      <div className="flex items-center space-x-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'UPCOMING'
              ? 'bg-[#111111] text-[#F4C542] shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Events ({upcomingEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'PAST'
              ? 'bg-[#111111] text-[#F4C542] shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Past / Expired Events ({pastEvents.length})</span>
        </button>
      </div>

      {displayedEvents.length === 0 ? (
        <EmptyState
          title={activeTab === 'UPCOMING' ? 'No Upcoming Events' : 'No Expired Events'}
          description={
            activeTab === 'UPCOMING'
              ? 'No upcoming get-togethers are scheduled yet.'
              : 'No past or expired events recorded in history.'
          }
          action={
            <Button onClick={() => navigate('/school-admin/events/create')}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Reunion
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((ev) => {
            const isPast = ev.event_date && ev.event_date < todayStr;
            const coverImage = getAssetUrl(ev.cover_image_url) || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80";

            return (
              <div
                key={ev.id}
                onClick={() => navigate(`/school-admin/events/${ev.id}`)}
                className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-xs hover:border-[#F4C542] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                {/* Event Banner Image Header */}
                <div className="h-44 overflow-hidden bg-gray-100 relative">
                  <img
                    src={coverImage}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Batch & Status Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="text-[11px] font-bold bg-[#111111] text-[#F4C542] border border-[#F4C542]/60 px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                      {ev.batch_name || 'School-wide'}
                    </span>
                    <Badge status={isPast ? 'PAST' : ev.status} />
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="font-bold text-white text-base leading-snug drop-shadow-md line-clamp-1">{ev.title}</h3>
                  </div>
                </div>

                {/* Event Info Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#6B7280] line-clamp-2">{ev.description}</p>

                  <div className="space-y-2 text-xs text-[#111111] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#854D0E] shrink-0" />
                      <span className="font-semibold">{ev.event_date} ({ev.start_time} - {ev.end_time})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#854D0E] shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                    {ev.registration_url && (
                      <div className="flex items-center space-x-2 text-blue-600 font-semibold pt-0.5">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Registration Link Configured</span>
                      </div>
                    )}
                  </div>

                  {/* Footer & Delete Action */}
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#111111] flex items-center">
                      <Users className="w-4 h-4 mr-1 text-[#854D0E]" />
                      {ev.attending_count} Confirmed
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, ev.id, ev.title)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
