import React from 'react';
import { ArrowRight, Camera, Calendar, MapPin, Users } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { getAssetUrl } from '../../../../utils/asset';
import { MemoriesSkeleton } from './SkeletonLoaders';

interface PastEventItem {
  id: string;
  title: string;
  image_url: string;
  event_date?: string;
  venue?: string;
  attending_count?: number;
  uploader_name?: string;
}

interface MemoriesPreviewProps {
  memories: PastEventItem[];
  loading?: boolean;
  onViewAllClick: () => void;
  onSelectMemory?: (memory: PastEventItem) => void;
}

export const MemoriesPreview: React.FC<MemoriesPreviewProps> = ({ memories, loading, onViewAllClick, onSelectMemory }) => {
  const { t, language } = useLanguage();

  return (
    <section id="memories-gallery" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            {/* <span className="inline-flex items-center space-x-2 text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
              <Camera className="w-4 h-4 text-[#854D0E]" />
              <span>{language === 'ta' ? 'கடந்த கால நிகழ்ச்சிகள் & நினைவுகள்' : 'Past School Events & Memory Gallery'}</span>
            </span> */}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight">
              {language === 'ta' ? 'பள்ளி வரலாற்று நிகழ்வுகள்' : 'Past School Events & Get-Togethers'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onViewAllClick}
            className="inline-flex items-center space-x-2.5 text-sm sm:text-base font-bold text-[#111111] hover:text-[#854D0E] bg-white border-2 border-[#E5E7EB] hover:border-[#F4C542] hover:bg-[#FFF7D6]/40 px-6 py-3.5 rounded-2xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <span>{t('view_all_memories')}</span>
            <ArrowRight className="w-5 h-5 text-[#854D0E]" />
          </button>
        </div>

        {/* Real Past Events Grid (Strictly Backend MongoDB Data) */}
        {loading ? (
          <MemoriesSkeleton />
        ) : !memories || memories.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">
              {language === 'ta' ? 'கடந்த கால நிகழ்ச்சிகள் எதுவும் கிடைக்கவில்லை.' : 'No past events found in database.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((event) => {
              const coverSrc = getAssetUrl(event.image_url) || '/school-images/banner.png';

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    if (onSelectMemory) onSelectMemory(event);
                    else onViewAllClick();
                  }}
                  className="bg-white border-2 border-[#111111] rounded-[32px] overflow-hidden shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#F4C542] transition-all duration-300 transform hover:-translate-x-1 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group h-72 relative"
                >
                  <img
                    src={coverSrc}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end space-y-2 z-10">
                    <span className="text-xs font-bold text-[#F4C542] bg-[#111111] border border-[#F4C542]/50 px-3 py-1 rounded-full self-start inline-flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#F4C542] mr-1 inline" />
                      <span>{event.event_date || 'Past Event'}</span>
                    </span>

                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md group-hover:text-[#F4C542] transition-colors line-clamp-1">
                      {event.title}
                    </h3>

                    {event.venue && (
                      <p className="text-xs text-gray-300 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber-300 inline mr-1" />
                        <span className="truncate">{event.venue}</span>
                      </p>
                    )}
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
