import React from 'react';
import { Calendar, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  return (
    <section id="upcoming-events" className="py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          {/* <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
            GET-TOGETHERS & REUNIONS
          </span> */}
          <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] tracking-tight pt-2">
            Upcoming Get-Togethers
          </h2>
          {/* <p className="text-lg text-gray-600 font-normal max-w-2xl mx-auto">
            Reconnect with your batchmates. View upcoming reunions, reserve seats, and check attendee rosters.
          </p> */}
        </div>

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

              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/85 via-[#FFF7D6]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

              {/* Event Content Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                <div>
                  <h3 className="text-2xl font-semibold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-base text-gray-600 font-normal mt-2.5 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2.5 text-base text-gray-700 font-normal pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[#854D0E] flex-shrink-0" />
                    <span className="font-semibold text-[#111111]">{event.event_date} ({event.start_time})</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-[#854D0E] flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Footer RSVP Attending Badge & Action Button */}
                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div className="inline-flex items-center space-x-2 bg-[#FFF7D6] border-2 border-[#F4C542] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#854D0E]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{event.attending_count} Alumni Attending</span>
                  </div>

                  <button
                    onClick={() => onSelectEvent(event)}
                    className="text-base font-semibold text-[#111111] hover:text-[#854D0E] flex items-center space-x-1.5 hover:underline"
                  >
                    <span>View Event</span>
                    <ArrowRight className="w-5 h-5 text-[#F4C542]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
