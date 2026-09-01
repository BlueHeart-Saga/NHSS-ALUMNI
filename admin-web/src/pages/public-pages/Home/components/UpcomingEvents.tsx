import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, ExternalLink, Clock, Users, X, QrCode, ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { EventsSkeleton } from './SkeletonLoaders';
import { getAssetUrl } from '../../../../utils/asset';

interface EventItem {
  id: string;
  title: string;
  batch_name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  address?: string;
  attending_count: number;
  max_capacity?: number;
  cover_image_url: string;
  registration_url?: string;
}

interface UpcomingEventsProps {
  events: EventItem[];
  loading?: boolean;
  onSelectEvent?: (event: EventItem) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, loading, onSelectEvent }) => {
  const { t, language } = useLanguage();
  const [selectedPreviewEvent, setSelectedPreviewEvent] = useState<EventItem | null>(null);

  const handleCardClick = (event: EventItem) => {
    setSelectedPreviewEvent(event);
    if (onSelectEvent) {
      // Optional callback, not triggering duplicate page modal
    }
  };

  return (
    <section id="upcoming-events" className="py-12 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight leading-tight">
            {t('upcoming_events_title')}
          </h2>

          <p className="text-xs sm:text-base text-gray-600 font-normal leading-relaxed">
            {language === 'ta'
              ? 'உங்கள் வகுப்புத் தோழர்களைச் சந்திக்கவும் பழைய நினைவுகளைப் பகிர்ந்து கொள்ளவும் ஏற்பாடு செய்யப்பட்டுள்ள விழாக்கள்.'
              : 'Reconnect with school batchmates, share nostalgic memories, and participate in upcoming reunions.'}
          </p>
        </div>

        {loading ? (
          <EventsSkeleton />
        ) : events.length === 0 ? (
          <div className="text-center py-14 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 max-w-2xl mx-auto space-y-3">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600 font-bold text-base">{t('no_events_yet')}</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {language === 'ta' ? 'புதிய நிகழ்ச்சிகள் விரைவில் அறிவிக்கப்படும்.' : 'Check back soon for newly published batch reunions.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {events.map((event) => {
              const coverImage = getAssetUrl(event.cover_image_url) ||
                getAssetUrl("/school-images/banner.png");

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#F4C542] transition-all duration-300 group transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* TOP COVER BANNER IMAGE */}
                  <div
                    onClick={() => handleCardClick(event)}
                    className="relative h-52 sm:h-64 w-full overflow-hidden bg-gray-900 cursor-pointer"
                  >
                    <img
                      src={coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Left Batch Badge */}
                    {/* <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                      <span className="text-xs font-black bg-[#111111] text-[#F4C542] px-3.5 py-1.5 rounded-full uppercase tracking-wider border-2 border-[#F4C542] shadow-md">
                        {event.batch_name}
                      </span>
                    </div> */}

                    {/* Top Right Attending Count Badge */}
                    {/* <div className="absolute top-4 right-4 z-10">
                      <span className="text-xs font-bold bg-white/90 backdrop-blur-md text-[#111111] px-3 py-1 rounded-full shadow-md flex items-center space-x-1.5 border border-white">
                        <Users className="w-3.5 h-3.5 text-[#854D0E]" />
                        <span>{event.attending_count ?? 0} {language === 'ta' ? 'உறுதிப்படுத்தப்பட்டவர்கள்' : 'Attending'}</span>
                      </span>
                    </div> */}

                    {/* Bottom Image Overlay Title */}
                    <div className="absolute bottom-4 left-5 right-5 z-10 text-white">
                      <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md line-clamp-1">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* BOTTOM CARD BODY OUTSIDE OF IMAGE WITH HIGHLIGHTED CTA BUTTONS */}
                  <div className="p-5 sm:p-7 space-y-4 bg-white flex-1 flex flex-col justify-between text-left">
                    <div className="space-y-3">
                      {/* Event Date & Venue Highlights Bar */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-gray-700">
                        <div className="flex items-center space-x-1.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-3 py-1 rounded-xl shadow-2xs">
                          <Calendar className="w-4 h-4 text-[#854D0E]" />
                          <span>{event.event_date} {event.start_time && `• ${event.start_time}`}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center space-x-1.5 bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-xl">
                            <MapPin className="w-4 h-4 text-[#854D0E]" />
                            <span className="truncate max-w-[240px]">{event.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* HIGHLIGHTED CTA ACTION BUTTONS OUTSIDE OF CARD IMAGE */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleCardClick(event)}
                        className="w-full sm:w-auto px-6 py-3.5 bg-[#111111] hover:bg-black text-[#F4C542] hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-[#F4C542] flex items-center justify-center space-x-2 cursor-pointer active:scale-95 group/btn"
                      >
                        <QrCode className="w-4 h-4 text-[#F4C542] group-hover/btn:rotate-12 transition-transform" />
                        <span>{language === 'ta' ? 'விவரங்கள் & QR பார்ஃகோட் பெற' : 'View Details & RSVP Ticket'}</span>
                        <ArrowRight className="w-4 h-4 text-[#F4C542] group-hover/btn:translate-x-1 transition-transform" />
                      </button>

                      {event.registration_url && (
                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full sm:w-auto px-5 py-3.5 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#854D0E] hover:text-[#111111] font-extrabold text-xs uppercase tracking-wider rounded-2xl border-2 border-[#F4C542] transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <span>{language === 'ta' ? 'பதிவு படிவம்' : 'External Register'}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL LENGTH TOP BANNER PREVIEW MODAL WITH REAL QR CODE BARCODE */}
      {selectedPreviewEvent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPreviewEvent(null)}
              className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* TOP WIDE BANNER IMAGE WITH INSIDE TITLE & BATCH BADGE */}
            <div className="h-60 sm:h-72 w-full relative bg-gray-900 shrink-0 overflow-hidden">
              <img
                src={getAssetUrl(selectedPreviewEvent.cover_image_url) || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80"}
                alt={selectedPreviewEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              <div className="absolute top-4 left-5 z-10">
                <span className="text-xs font-extrabold bg-[#111111] text-[#F4C542] px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-[#F4C542]">
                  {selectedPreviewEvent.batch_name}
                </span>
              </div>

              <div className="absolute bottom-5 left-6 right-6 z-10 text-white">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
                  {selectedPreviewEvent.title}
                </h2>
              </div>
            </div>

            {/* MIDDLE DETAILS & QR CODE CONTENT */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Event Date & Time Field (Outside Banner Photo) */}
              <div className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-2 rounded-2xl shadow-xs">
                <Clock className="w-4 h-4 text-[#854D0E]" />
                <span>{selectedPreviewEvent.event_date} ({selectedPreviewEvent.start_time || '10:00 AM'})</span>
              </div>
              {/* Event Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#854D0E] uppercase tracking-wider">
                  {language === 'ta' ? 'நிகழ்ச்சி பற்றிய தகவல்' : 'About This Event'}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                  {selectedPreviewEvent.description}
                </p>
              </div>

              {/* Event Metrics & Venue Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FFF7D6]/40 border border-[#F4C542]/50 rounded-2xl space-y-1">
                  <div className="text-gray-500 font-bold flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-[#854D0E]" />
                    <span>{language === 'ta' ? 'நடைபெறும் இடம்' : 'Venue & Location'}</span>
                  </div>
                  <div className="font-bold text-[#111111] text-sm">{selectedPreviewEvent.venue}</div>
                </div>

                <div className="p-4 bg-[#FFF7D6]/40 border border-[#F4C542]/50 rounded-2xl space-y-1">
                  <div className="text-gray-500 font-bold flex items-center space-x-1">
                    <Users className="w-4 h-4 text-[#854D0E]" />
                    <span>{language === 'ta' ? 'உறுப்பினர்கள் எண்ணிக்கை' : 'Confirmed Attendees'}</span>
                  </div>
                  <div className="font-bold text-[#111111] text-sm">{selectedPreviewEvent.attending_count ?? 0} {language === 'ta' ? 'உறுப்பினர்கள் உறுதிப்படுத்தப்பட்டுள்ளனர்' : 'Confirmed Alumni'}</div>
                </div>
              </div>

              {/* REAL AUTO-GENERATED QR CODE BARCODE SECTION */}
              <div className="p-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white rounded-3xl border-2 border-[#F4C542] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#F4C542] bg-[#F4C542]/20 px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4C542]/40">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'மொபைல் QR ஸ்கேன்' : 'Mobile Scan & RSVP'}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {language === 'ta' ? 'மொபைல் கேமரா மூலம் ஸ்கேன் செய்க' : 'Scan QR Code with Mobile Phone'}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {language === 'ta'
                      ? 'உங்கள் மொபைல் கேமரா மூலம் இந்த QR பார்ஃகோடை ஸ்கேன் செய்து நேரடியாக பதிவு படிவத்தைத் திறக்கலாம்.'
                      : 'Scan this live QR Code barcode with your smartphone camera to open the event registration & RSVP page.'}
                  </p>
                </div>

                {/* Auto-Generated Scannable QR Code Image */}
                <div className="p-3 bg-white rounded-2xl shadow-2xl border-2 border-[#F4C542] shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      selectedPreviewEvent.registration_url || `${window.location.origin}/login`
                    )}`}
                    alt="Event QR Barcode"
                    className="w-32 h-32 object-contain"
                  />
                  <div className="text-[10px] font-bold text-center text-gray-700 mt-1 uppercase tracking-widest">
                    SCAN QR
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              {selectedPreviewEvent.registration_url ? (
                <a
                  href={selectedPreviewEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3 bg-[#F4C542] hover:bg-[#E0B030] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-yellow-500"
                >
                  <span>{language === 'ta' ? 'வலைத்தளத்தில் நேரடியாக பதிவு செய்ய' : 'Open Registration Website'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="text-xs text-gray-500 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ta' ? 'அதிகாரப்பூர்வ பள்ளி பழைய மாணவர்கள் விழா' : 'Official Verified School Reunion Event'}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedPreviewEvent(null)}
                className="w-full sm:w-auto px-6 py-3 bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {language === 'ta' ? 'மூடு' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
