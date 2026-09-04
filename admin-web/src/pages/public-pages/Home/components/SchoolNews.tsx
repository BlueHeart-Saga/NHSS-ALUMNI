import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { NewsSkeleton } from './SkeletonLoaders';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface SchoolNewsProps {
  announcements: NewsItem[];
  loading?: boolean;
  onSelectNews: (item: NewsItem) => void;
}

export const SchoolNews: React.FC<SchoolNewsProps> = ({ announcements, loading, onSelectNews }) => {
  const { t, language } = useLanguage();

  return (
    <section id="school-news" className="py-12 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {language === 'ta' ? 'பள்ளிச் செய்திகள் மற்றும் புதிய அறிவிப்புகள்' : 'School News & Official Updates'}
          </h2>
        </div>

        {loading ? (
          <NewsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/90 via-[#FFF7D6]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

              <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
                <div>
                  <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-semibold text-[#854D0E] bg-[#FFF7D6] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full w-fit mb-3 sm:mb-4 border border-[#F4C542]/60">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#854D0E]" />
                    <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#111111] group-hover:text-[#854D0E] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-normal mt-2 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectNews(item)}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-[#111111] hover:text-[#854D0E] uppercase tracking-wider cursor-pointer"
                >
                  <span>{language === 'ta' ? 'மேலும் படிக்க' : 'Read Full Announcement'}</span>
                  <ArrowRight className="w-4 h-4 text-[#854D0E]" />
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
