import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const PublicEvents: React.FC = () => {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicEvents().then(setEvents).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white text-[#111111] animate-fadeIn">
      {/* Header Banner */}
      <div className="py-10 sm:py-16 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('events_page_title')}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between relative group"
            >
              <div className="relative h-48 sm:h-60 overflow-hidden bg-gray-100">
                <img
                  src={event.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="text-xs sm:text-sm font-semibold bg-[#111111] text-[#F4C542] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-md uppercase tracking-wider border border-[#F4C542]">
                    {event.batch_name}
                  </span>
                </div>
              </div>

              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/85 via-[#FFF7D6]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 sm:space-y-6 relative z-10">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-base text-gray-600 font-normal mt-2 sm:mt-2.5 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] flex-shrink-0" />
                    <span className="font-semibold">{event.event_date} {event.start_time && `• ${event.start_time}`}</span>
                  </div>
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E] flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="w-full py-3 sm:py-3.5 px-4 sm:px-6 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{t('event_register_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
