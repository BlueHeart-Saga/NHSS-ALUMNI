import React from 'react';
import { Calendar, ArrowRight, Newspaper, Clock, FileText, Megaphone, PartyPopper, BookOpen, Award, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { NewsSkeleton } from './SkeletonLoaders';

export interface NewsItem {
  id: string;
  title: string;
  title_ta?: string;
  content: string;
  content_ta?: string;
  poster_url?: string;
  category?: string;
  created_at: string;
}

interface SchoolNewsProps {
  announcements: NewsItem[];
  loading?: boolean;
  onSelectNews: (item: NewsItem) => void;
}

const CATEGORY_MAP: Record<string, { labelEn: string; labelTa: string; icon: any; color: string }> = {
  GENERAL: { labelEn: 'Notice', labelTa: 'அறிவிப்பு', icon: Megaphone, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  CIRCULAR: { labelEn: 'Circular', labelTa: 'சுற்றறிக்கை', icon: FileText, color: 'bg-blue-100 text-blue-900 border-blue-300' },
  EVENT_NOTICE: { labelEn: 'Event Notice', labelTa: 'நிகழ்வு', icon: Calendar, color: 'bg-purple-100 text-purple-900 border-purple-300' },
  CELEBRATION: { labelEn: 'Celebration', labelTa: 'விழா / கொண்டாட்டம்', icon: PartyPopper, color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ACADEMIC: { labelEn: 'Academic', labelTa: 'கல்வி / தேர்வு', icon: BookOpen, color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  ACHIEVEMENT: { labelEn: 'Achievement', labelTa: 'சாதனை', icon: Award, color: 'bg-orange-100 text-orange-900 border-orange-300' },
};

export const SchoolNews: React.FC<SchoolNewsProps> = ({ announcements, loading, onSelectNews }) => {
  const { language } = useLanguage();

  const getCategoryInfo = (cat?: string) => {
    return CATEGORY_MAP[cat || 'GENERAL'] || CATEGORY_MAP.GENERAL;
  };

  return (
    <section id="school-news" className="py-12 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          {/* <div className="inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/80 px-3.5 py-1 rounded-full text-xs font-bold text-[#854D0E] mb-2">
            <Megaphone className="w-3.5 h-3.5 text-[#854D0E]" />
            <span>{language === 'ta' ? 'அறிவிப்புகள்' : 'Official Bulletins'}</span>
          </div> */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {language === 'ta' ? 'செய்திகள் மற்றும் புதிய அறிவிப்புகள்' : 'School News & Official Updates'}
          </h2>
          {/* <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            {language === 'ta'
              ? ' முக்கிய நிகழ்வுகள், சுற்றறிக்கைகள் மற்றும் முன்னாள் மாணவர்களுக்கான அறிவிப்புகள்'
              : 'Stay informed with the latest school events, official circulars, and community broadcasts'}
          </p> */}
        </div>

        {loading ? (
          <NewsSkeleton />
        ) : announcements.length === 0 ? (
          /* Empty State Placeholder when news data is 0 */
          <div className="max-w-2xl mx-auto text-center py-12 px-6 sm:px-12 bg-gradient-to-b from-[#FFFDF5] to-white border-2 border-dashed border-[#F4C542]/70 rounded-3xl shadow-xs space-y-5 animate-fadeIn">
            {/* Ambient Icon with Pulse Dot */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#FFF7D6] border border-[#F4C542] flex items-center justify-center text-[#854D0E] shadow-xs transform hover:scale-105 transition-transform">
                <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F4C542] border-2 border-white"></span>
              </span>
            </div>

            {/* Status Pill Badge */}
            <div>
              <span className="inline-flex items-center space-x-2 bg-[#FFF7D6] border border-[#F4C542]/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#854D0E] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#854D0E]" />
                <span>
                  {language === 'ta' ? 'புதிய தகவல்கள் விரைவில் வெளியாகும்' : 'Official Updates Coming Soon'}
                </span>
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#111111]">
                {language === 'ta'
                  ? ' செய்திகள் விரைவில் பகிரப்படும்'
                  : 'School Updates Will Be Published Soon'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                {language === 'ta'
                  ? 'முக்கிய நிகழ்வுகள், தேர்வு அறிவிப்புகள், சாதனைகள் மற்றும் சுற்றறிக்கைகள் விரைவில் இங்கு பதிவேற்றப்படும். தொடர்ந்து இணைந்திருங்கள்!'
                  : 'Important school circulars, exam notifications, upcoming celebrations, and student achievements will be posted here soon. Stay tuned!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {announcements.map((item) => {
              const cat = getCategoryInfo(item.category);
              const CatIcon = cat.icon;
              
              // Resolve Title & Content based on active language
              const displayTitle = language === 'ta' 
                ? (item.title_ta || item.title) 
                : item.title;
              
              const subtitle = language === 'ta' && item.title_ta && item.title !== item.title_ta
                ? item.title
                : !language.startsWith('ta') && item.title_ta
                ? item.title_ta
                : null;

              const displayContent = language === 'ta'
                ? (item.content_ta || item.content)
                : item.content;

              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between group"
                >
                  {/* Top Poster Flyer Image (If available) */}
                  {item.poster_url ? (
                    <div 
                      className="relative aspect-[16/9] w-full bg-gray-900 overflow-hidden cursor-pointer"
                      onClick={() => onSelectNews(item)}
                    >
                      <img
                        src={item.poster_url}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                      
                      {/* Top floating category pill */}
                      {/* <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-md inline-flex items-center space-x-1 ${cat.color}`}>
                          <CatIcon className="w-3 h-3 mr-1 inline" />
                          <span>{language === 'ta' ? cat.labelTa : cat.labelEn}</span>
                        </span>
                      </div> */}

                      {/* Poster Indicator icon */}
                      {/* <div className="absolute bottom-3 right-3 text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{language === 'ta' ? 'சுவரொட்டி' : 'Poster'}</span>
                      </div> */}
                    </div>
                  ) : (
                    /* Clean Branded Header when no poster flyer */
                    <div className="h-24 bg-gradient-to-r from-amber-50 via-[#FFFDF5] to-amber-100/60 p-4 border-b border-amber-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#F4C542] flex items-center justify-center text-[#854D0E] shadow-2xs">
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                          {language === 'ta' ? cat.labelTa : cat.labelEn}
                        </span>
                      </div>
                      <Newspaper className="w-6 h-6 text-amber-400/40" />
                    </div>
                  )}

                  {/* Body Content Area */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Date Badge */}
                      <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 rounded-full w-fit border border-[#F4C542]/60">
                        <Calendar className="w-3.5 h-3.5 text-[#854D0E]" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                        {displayTitle}
                      </h3>

                      {/* Secondary Subtitle if bilingual */}
                      {subtitle && (
                        <p className="text-xs font-medium text-amber-900/80 line-clamp-1 italic">
                          {subtitle}
                        </p>
                      )}

                      {/* Content Excerpt */}
                      <p className="text-xs sm:text-sm text-gray-600 font-normal line-clamp-3 leading-relaxed">
                        {displayContent}
                      </p>
                    </div>

                    {/* Footer Button */}
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => onSelectNews(item)}
                        className="inline-flex items-center space-x-2 text-xs font-bold text-[#111111] group-hover:text-[#854D0E] uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        <span>{language === 'ta' ? 'முழு விவரம் படிக்க' : 'Read Full Announcement'}</span>
                        <ArrowRight className="w-4 h-4 text-[#854D0E] group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
