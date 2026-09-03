import React, { useState } from 'react';
import { ArrowRight, Camera, Calendar, MapPin, ChevronDown } from 'lucide-react';
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
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const visibleMemories = (memories || []).slice(0, visibleCount);
  const hasMore = (memories || []).length > visibleCount;

  return (
    <section id="memories-gallery" className="py-12 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight">
              {language === 'ta' ? 'பள்ளி வரலாற்று நிகழ்வுகள்' : 'Past School Events & Get-Togethers'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onViewAllClick}
            className="inline-flex items-center justify-center space-x-2 text-xs sm:text-base font-bold text-[#111111] hover:text-[#854D0E] bg-white border-2 border-[#E5E7EB] hover:border-[#F4C542] hover:bg-[#FFF7D6]/40 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl transition-all shadow-xs cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <span>{t('view_all_memories')}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#854D0E]" />
          </button>
        </div>

        {/* Real Past Events Grid (Strictly Backend MongoDB Data) */}
        {loading ? (
          <MemoriesSkeleton />
        ) : !memories || memories.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-gray-600">
              {language === 'ta' ? 'கடந்த கால நிகழ்ச்சிகள் எதுவும் கிடைக்கவில்லை.' : 'No past events found in database.'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {visibleMemories.map((event, idx) => {
                const coverSrc = getAssetUrl(event.image_url) || '/school-images/banner.png';
                const isAboveFold = idx < 3;

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      if (onSelectMemory) onSelectMemory(event);
                      else onViewAllClick();
                    }}
                    className="bg-white border-2 border-[#111111] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-[4px_4px_0px_0px_#111111] sm:shadow-[6px_6px_0px_0px_#111111] hover:shadow-[8px_8px_0px_0px_#F4C542] transition-all duration-300 transform hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group h-60 sm:h-72 relative bg-slate-100"
                  >
                    <img
                      src={coverSrc}
                      alt={event.title}
                      loading={isAboveFold ? "eager" : "lazy"}
                      decoding="async"
                      {...(isAboveFold ? { fetchPriority: "high" } : {})}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-6 flex flex-col justify-end space-y-1.5 sm:space-y-2 z-10">
                      <span className="text-[10px] sm:text-xs font-bold text-[#F4C542] bg-[#111111] border border-[#F4C542]/50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full self-start inline-flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#F4C542] mr-1 inline" />
                        <span>{event.event_date || 'Past Event'}</span>
                      </span>

                      <h3 className="text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md group-hover:text-[#F4C542] transition-colors line-clamp-1">
                        {event.title}
                      </h3>

                      {event.venue && (
                        <p className="text-xs text-gray-300 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-amber-300 inline mr-1 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button (+3 Cards) */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-[#111111] text-white font-extrabold text-sm rounded-2xl shadow-lg hover:bg-black hover:shadow-[0_4px_20px_rgba(244,197,66,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>
                    {language === 'ta'
                      ? `மேலும் நிகழ்வுகளைக் காண்க (+3)`
                      : `View More Events (+3)`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#F4C542] animate-bounce" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
