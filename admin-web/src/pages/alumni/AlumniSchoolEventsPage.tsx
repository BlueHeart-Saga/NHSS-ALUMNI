import React, { useEffect, useState } from 'react';
import { 
  Calendar, MapPin, Clock, Award, Sparkles, Filter, ChevronRight, X, UserCheck, Loader2, Image as ImageIcon 
} from 'lucide-react';
import { api } from '../../services/api';
import { SchoolEventItem } from '../../types';

export const AlumniSchoolEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SchoolEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SchoolEventItem | null>(null);

  const fetchSchoolEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getSchoolEvents();
      setEvents(data || []);
    } catch (err) {
      console.warn('Fallback to public school events:', err);
      api.getPublicSchoolEvents()
        .then(res => setEvents(res || []))
        .catch(console.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
  });

  const formatCategoryName = (cat: string) => {
    if (!cat) return '';
    return cat
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // Extract unique categories dynamically from actual backend events
  const dynamicCategories = Array.from(new Set(events.map(e => e.category).filter(Boolean)));

  const categories = [
    { id: 'ALL', label: `All Celebrations (${events.length})` },
    ...dynamicCategories.map(cat => ({
      id: cat,
      label: `${formatCategoryName(cat)} (${events.filter(e => e.category === cat).length})`
    }))
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-[#111111]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1E1E1E] to-[#2A2A2A] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            School Events & Celebrations
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
            Explore annual functions, sports meets, science fairs, and school anniversary celebrations recorded directly from the administration.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-[#F4C542]/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E7EB] pb-2 text-xs font-bold scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              categoryFilter === cat.id
                ? 'bg-[#111111] text-white shadow-sm'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111111]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#854D0E] animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Fetching official school events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
              <div>
                <div className="h-44 bg-[#FFF7D6] relative overflow-hidden">
                  <img
                    src={event.cover_image_url || '/school-images/banner.png'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-md text-[#F4C542] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#F4C542]/40">
                    {event.category.replace('_', ' ')}
                  </div>
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    event.status === 'UPCOMING' ? 'bg-emerald-500 text-white' : 'bg-gray-800/80 text-gray-200'
                  }`}>
                    {event.status}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-sm text-[#111111] group-hover:text-amber-800 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#4B5563]">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{event.event_date} {event.end_date ? `to ${event.end_date}` : ''}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{event.start_time || '09:00 AM'} - {event.end_time || '04:00 PM'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>

                    {event.chief_guest && (
                      <div className="flex items-center space-x-2 text-amber-900 font-semibold pt-1">
                        <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">Chief Guest: {event.chief_guest}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="w-full py-2.5 bg-[#FAFAFA] hover:bg-[#F3F4F6] text-[#111111] font-bold text-xs rounded-xl border border-[#E5E7EB] transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>View Event Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E5E7EB] text-center space-y-3">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-sm text-[#111111]">No School Events Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No events match the selected category filter right now.
          </p>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-gray-800"
          >
            Show All Events
          </button>
        </div>
      )}

      {/* Event Detail View Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#111111] p-1 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-48 rounded-2xl overflow-hidden bg-[#FFF7D6] relative border border-gray-200">
              <img
                src={selectedEvent.cover_image_url || '/school-images/banner.png'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-md text-[#F4C542] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-[#F4C542]/40">
                {selectedEvent.category.replace('_', ' ')}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-lg text-[#111111]">{selectedEvent.title}</h3>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAFAFA] p-3.5 rounded-2xl border border-[#E5E7EB]">
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">EVENT DATE</span>
                  <span className="font-bold text-[#111111]">{selectedEvent.event_date}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">TIME</span>
                  <span className="font-bold text-[#111111]">{selectedEvent.start_time || '09:00 AM'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">VENUE</span>
                  <span className="font-bold text-[#111111]">{selectedEvent.venue}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">AUDIENCE</span>
                  <span className="font-bold text-[#111111]">{selectedEvent.target_audience || 'ALL STUDENTS'}</span>
                </div>
              </div>

              {selectedEvent.chief_guest && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Chief Guest:</strong> {selectedEvent.chief_guest}</span>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="font-bold text-xs text-[#111111]">Event Description</h4>
                <p className="text-xs text-[#374151] leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.gallery_urls && selectedEvent.gallery_urls.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <span>Event Photo Highlights</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedEvent.gallery_urls.map((img, i) => (
                      <img key={i} src={img} alt="Event highlight" className="h-20 w-full object-cover rounded-xl border border-gray-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2.5 bg-[#111111] text-white hover:bg-black font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Close Event Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
