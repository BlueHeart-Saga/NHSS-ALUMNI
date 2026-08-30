import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface EventItem {
  id: string;
  title: string;
  batch_name: string;
  description: string;
  event_date: string;
  start_time: string;
  venue: string;
  attending_count: number;
  cover_image_url: string;
}

interface UpcomingEventsProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onSelectEvent }) => {
  const { t, language } = useLanguage();

  return (
    <section id="upcoming-events" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('upcoming_events_title')}
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('no_events_yet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative group"
              >
                {/* Event Cover Photo Banner */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={event.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-sm font-semibold bg-[#111111] text-[#F4C542] px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider border border-[#F4C542]">
                      {event.batch_name}
                    </span>
                  </div>
                </div>

                {/* Event Content Details */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-[#111111] leading-snug group-hover:text-[#854D0E] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100 text-sm text-gray-700">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#854D0E] flex-shrink-0" />
                      <span className="font-semibold">{event.event_date} {event.start_time && `• ${event.start_time}`}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-[#854D0E] flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="w-full py-3.5 px-6 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-4"
                  >
                    <span>{t('event_register_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
