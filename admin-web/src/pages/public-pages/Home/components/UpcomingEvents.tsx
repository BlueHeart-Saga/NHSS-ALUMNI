import React from 'react';
import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
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
  registration_url?: string;
}

interface UpcomingEventsProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onSelectEvent }) => {
  const { t, language } = useLanguage();

  return (
    <section id="upcoming-events" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="space-y-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-1 flex flex-col md:flex-row group relative"
              >
                {/* Event Cover Photo Banner (Wide Left Side on Desktop) */}
                <div className="md:w-5/12 relative h-64 md:h-auto overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={event.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-xs font-bold bg-[#111111] text-[#F4C542] px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider border border-[#F4C542]">
                      {event.batch_name}
                    </span>
                  </div>
                </div>

                {/* Event Content Details (Right Side on Desktop) */}
                <div className="p-6 sm:p-8 md:w-7/12 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] leading-tight group-hover:text-[#854D0E] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-700 font-semibold">
                    <div className="flex items-center space-x-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <Calendar className="w-4 h-4 text-[#854D0E] shrink-0" />
                      <span className="truncate">{event.event_date} {event.start_time && `• ${event.start_time}`}</span>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <MapPin className="w-4 h-4 text-[#854D0E] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto py-3 px-6 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#F4C542]/50 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-[#F4C542]" />
                        <span>{language === 'ta' ? 'விண்ணப்பிக்க / பதிவு செய்க ↗' : 'Apply / Register Now ↗'}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectEvent(event)}
                      className="w-full sm:flex-1 py-3 px-6 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>{t('event_register_btn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
