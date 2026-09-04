import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, Clock, Users, QrCode, Search, Sparkles, Filter, ExternalLink, X, CheckCircle2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getAssetUrl } from '../../utils/asset';

interface EventItem {
  id: string;
  title: string;
  title_ta?: string;
  batch_name?: string;
  description: string;
  description_ta?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  venue: string;
  address?: string;
  attending_count?: number;
  max_capacity?: number;
  cover_image_url: string;
  cover_image_url_ta?: string;
  registration_url?: string;
  status?: string;
}

// Progressive Image Component with Instant Skeleton & Smooth Fade-In
const EventImage: React.FC<{
  src: string;
  alt: string;
  isPast?: boolean;
  isAboveTheFold?: boolean;
}> = ({ src, alt, isPast, isAboveTheFold }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-300 opacity-60" />
        </div>
      )}
      <img
        src={error ? getAssetUrl('/school-images/banner.png') : src}
        alt={alt}
        loading={isAboveTheFold ? "eager" : "lazy"}
        decoding="async"
        {...(isAboveTheFold ? { fetchPriority: "high" } : {})}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${isPast ? 'grayscale contrast-125 group-hover:grayscale-0' : ''}`}
      />
    </div>
  );
};

const ITEMS_PER_BATCH = 6;

export const PublicEvents: React.FC = () => {
  const { t, language } = useLanguage();
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');

  // Pagination / Batch display state
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_BATCH);

  // Preview Modal State
  const [selectedPreviewEvent, setSelectedPreviewEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    let active = true;

    // Parallel fetching with progressive rendering
    api.getPublicEvents()
      .then(upData => {
        if (active && upData) {
          setUpcomingEvents(upData);
          setLoading(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    api.getPublicPastEvents()
      .then(pastData => {
        if (active && pastData) {
          setPastEvents(pastData);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Reset batch count on filter or tab change for fast view switching
  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [activeTab, searchQuery]);

  // Combine & filter events based on active tab and search query
  const allCombined = [
    ...upcomingEvents.map(e => ({ ...e, isPast: false })),
    ...pastEvents.map(e => ({ ...e, isPast: true }))
  ];

  const filteredEvents = allCombined.filter((ev) => {
    if (activeTab === 'UPCOMING' && ev.isPast) return false;
    if (activeTab === 'PAST' && !ev.isPast) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title?.toLowerCase().includes(q);
      const matchVenue = ev.venue?.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      return matchTitle || matchVenue || matchDesc;
    }
    return true;
  });

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;
  const remainingCount = filteredEvents.length - visibleCount;

  return (
    <div className="min-h-screen bg-white text-[#111111] animate-fadeIn font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="py-12 sm:py-20 bg-white border-b border-[#E5E7EB] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-[#854D0E]" />
            <span>{language === 'ta' ? 'பள்ளி விழாக்கள் & பழைய மாணவர்கள் சந்திப்பு' : 'School Reunions & Celebrations'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-tight">
            {t('events_page_title')}
          </h1>

          <p className="text-base sm:text-xl text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
            {language === 'ta'
              ? 'எங்கள் பள்ளியின் வரலாற்றுச் சிறப்புமிக்க விழாக்கள், வகுப்பு மறுசந்திப்புகள் மற்றும் சிறப்பு நிகழ்வுகளில் பங்கேற்கவும்.'
              : 'Discover upcoming alumni reunions, centenary celebrations, and past event recaps of Natarajan Higher Secondary School.'}
          </p>

          {/* Search & Sub-Navigation Tabs */}
          <div className="pt-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ta' ? 'நிகழ்வின் தலைப்பு அல்லது இடத்தைத் தேடுக...' : 'Search event name, venue, or details...'}
                className="w-full pl-12 pr-4 py-3.5 bg-[#FAFAFA] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#F4C542] text-sm font-medium transition-all shadow-xs"
              />
            </div>

            <div className="flex border-2 border-[#E5E7EB] bg-gray-50 p-1.5 rounded-2xl w-full sm:w-auto shrink-0 justify-center">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#111111]'
                }`}
              >
                {language === 'ta' ? `அனைத்தும் (${allCombined.length})` : `All (${allCombined.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'UPCOMING'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#111111]'
                }`}
              >
                {language === 'ta' ? `வரவிருப்பவை (${upcomingEvents.length})` : `Upcoming (${upcomingEvents.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PAST')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'PAST'
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#111111]'
                }`}
              >
                {language === 'ta' ? `கடந்தகாலவை (${pastEvents.length})` : `Past Events (${pastEvents.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EVENTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-[420px] animate-pulse">
                <div className="h-52 sm:h-60 bg-gray-200 w-full" />
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-100 rounded-lg w-full" />
                    <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 max-w-xl mx-auto space-y-3">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-700 font-bold text-base">
              {language === 'ta' ? 'எந்த நிகழ்வுகளும் கிடைக்கவில்லை.' : 'No events found matching your filter.'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'ta' ? 'வெவ்வேறு தேடல் சொற்களை முயற்சி செய்து பாருங்கள்.' : 'Try searching for different keywords or clear search filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleEvents.map((event, idx) => {
                const coverImage = (language === 'ta'
                  ? (getAssetUrl(event.cover_image_url_ta) || getAssetUrl(event.cover_image_url))
                  : (getAssetUrl(event.cover_image_url) || getAssetUrl(event.cover_image_url_ta))) || getAssetUrl('/school-images/banner.png') || '/school-images/banner.png';

                const displayTitle = (language === 'ta'
                  ? (event.title_ta || event.title)
                  : (event.title || event.title_ta)) || 'Event';

                const displayDescription = language === 'ta'
                  ? (event.description_ta || event.description)
                  : (event.description || event.description_ta);

                const isAboveTheFold = idx < 3;

                return (
                  <div
                    key={event.id}
                    className="bg-white border-2 border-[#111111] rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#F4C542] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between relative group"
                  >
                    {/* COVER BANNER IMAGE WITH PROGRESSIVE SKELETON */}
                    <div
                      onClick={() => setSelectedPreviewEvent(event)}
                      className="relative h-52 sm:h-60 w-full overflow-hidden bg-gray-100 cursor-pointer border-b-2 border-[#111111]"
                    >
                      <EventImage
                        src={coverImage}
                        alt={displayTitle}
                        isPast={event.isPast}
                        isAboveTheFold={isAboveTheFold}
                      />

                      {/* Status Badge Tag */}
                      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider border ${
                          event.isPast
                            ? 'bg-gray-900 text-gray-300 border-gray-700'
                            : 'bg-[#111111] text-[#F4C542] border-[#F4C542]'
                        }`}>
                          {event.isPast ? (language === 'ta' ? 'கடந்த நிகழ்ச்சி' : 'Past Event') : (language === 'ta' ? 'வரவிருக்கும் நிகழ்ச்சி' : 'Upcoming Event')}
                        </span>
                      </div>

                      {/* Date Badge Pill */}
                      <div className="absolute bottom-3 right-3 z-10 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-xl border border-white/20 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-[#F4C542]" />
                        <span>{event.event_date}</span>
                      </div>
                    </div>

                    {/* CARD BODY CONTENT */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-2.5">
                        <h3
                          onClick={() => setSelectedPreviewEvent(event)}
                          className="text-xl font-extrabold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-tight cursor-pointer line-clamp-2"
                        >
                          {displayTitle}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-600 font-normal line-clamp-3 leading-relaxed">
                          {displayDescription}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-gray-100 text-xs font-medium text-gray-700">
                        {event.start_time && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#854D0E] shrink-0" />
                            <span>{event.start_time}</span>
                          </div>
                        )}

                        {event.venue && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-[#854D0E] shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* CARD FOOTER BUTTONS */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                        {event.registration_url && (
                          <a
                            href={event.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 px-4 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#854D0E] hover:text-[#111111] font-bold text-xs uppercase tracking-wider rounded-2xl border border-[#F4C542] transition-all flex items-center justify-center space-x-1.5"
                          >
                            <span>{language === 'ta' ? 'பதிவு படிவம்' : 'Register'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. LOAD MORE BUTTON (+6 Events per click) */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_BATCH)}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-[#111111] hover:bg-black text-[#F4C542] hover:text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_0px_#F4C542] hover:shadow-[6px_6px_0px_0px_#111111] transition-all transform hover:-translate-y-1 border-2 border-[#111111] cursor-pointer group"
                >
                  <span>
                    {language === 'ta'
                      ? `மேலும் நிகழ்ச்சிகளைக் காண்க (${remainingCount} உள்ளன)`
                      : `Load More Events (${remainingCount} remaining)`}
                  </span>
                  <ChevronDown className="w-5 h-5 text-[#F4C542] group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* DETAILED PREVIEW MODAL */}
      {selectedPreviewEvent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-[#F4C542] overflow-hidden max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPreviewEvent(null)}
              className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Header Image */}
            <div className="h-56 sm:h-64 w-full relative bg-gray-900 shrink-0 overflow-hidden">
              <img
                src={
                  language === 'ta'
                    ? (getAssetUrl(selectedPreviewEvent.cover_image_url_ta) || getAssetUrl(selectedPreviewEvent.cover_image_url) || getAssetUrl('/school-images/banner.png'))
                    : (getAssetUrl(selectedPreviewEvent.cover_image_url) || getAssetUrl(selectedPreviewEvent.cover_image_url_ta) || getAssetUrl('/school-images/banner.png'))
                }
                alt={
                  language === 'ta'
                    ? (selectedPreviewEvent.title_ta || selectedPreviewEvent.title)
                    : (selectedPreviewEvent.title || selectedPreviewEvent.title_ta)
                }
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              <div className="absolute bottom-5 left-6 right-6 z-10 text-white">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
                  {language === 'ta'
                    ? (selectedPreviewEvent.title_ta || selectedPreviewEvent.title)
                    : (selectedPreviewEvent.title || selectedPreviewEvent.title_ta)}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <div className="flex items-center space-x-1.5 bg-[#FFF7D6] text-[#854D0E] border border-[#F4C542] px-3 py-1.5 rounded-xl">
                  <Calendar className="w-4 h-4 text-[#854D0E]" />
                  <span>{selectedPreviewEvent.event_date} {selectedPreviewEvent.start_time && `• ${selectedPreviewEvent.start_time}`}</span>
                </div>

                {selectedPreviewEvent.venue && (
                  <div className="flex items-center space-x-1.5 bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-4 h-4 text-[#854D0E]" />
                    <span>{selectedPreviewEvent.venue}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">{language === 'ta' ? 'நிகழ்ச்சி விவரங்கள் & நிகழ்ச்சி நிரல்:' : 'Event Description & Agenda:'}</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  {language === 'ta'
                    ? (selectedPreviewEvent.description_ta || selectedPreviewEvent.description)
                    : (selectedPreviewEvent.description || selectedPreviewEvent.description_ta)}
                </p>
              </div>

              {selectedPreviewEvent.address && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{language === 'ta' ? 'முழு இடம்:' : 'Full Address:'}</h4>
                  <p className="text-gray-700 font-mono text-xs">{selectedPreviewEvent.address}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login"
                  className="flex-1 py-3 bg-[#111111] hover:bg-black text-[#F4C542] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md text-center border-2 border-[#F4C542]"
                >
                  {language === 'ta' ? 'உள்நுழைந்து RSVP டிக்கெட் பெறுக' : 'Login to Claim RSVP Pass'}
                </Link>
                {selectedPreviewEvent.registration_url && (
                  <a
                    href={selectedPreviewEvent.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#FFF7D6] hover:bg-[#F4C542] text-[#854D0E] font-extrabold text-xs uppercase tracking-wider rounded-xl text-center border border-[#F4C542]"
                  >
                    {language === 'ta' ? 'வெளிப்புற பதிவு படிவம்' : 'External Register'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
