import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { getAssetUrl } from '../../../../utils/asset';

interface MemoryItem {
  id: string;
  title: string;
  image_url: string;
  uploader_name: string;
}

interface MemoriesPreviewProps {
  memories: MemoryItem[];
  onViewAllClick: () => void;
}

export const MemoriesPreview: React.FC<MemoriesPreviewProps> = ({ memories, onViewAllClick }) => {
  const { t, language } = useLanguage();

  const defaultRealMemories = [
    { id: '1', title: language === 'ta' ? 'பாரம்பரிய நுழைவாயில்' : 'Heritage Entrance', image_url: getAssetUrl('/school-images/school-door.png'), uploader_name: 'School Archives' },
    { id: '2', title: language === 'ta' ? 'குடியரசு தின விழா' : 'Republic Day Parade', image_url: getAssetUrl('/school-images/Republic-Day.png'), uploader_name: 'Alumni Network' },
    { id: '3', title: language === 'ta' ? 'இலவச மிதிவண்டி திட்டம்' : 'Free Bicycle Distribution', image_url: getAssetUrl('/school-images/give-cycle.png'), uploader_name: 'Batch of 2012' },
    { id: '4', title: language === 'ta' ? 'பழைய மாணவர்கள் செல்ஃபி' : 'Alumni Reunion Selfie', image_url: getAssetUrl('/school-images/old-students-selfie.png'), uploader_name: 'Batch of 2005' },
    { id: '5', title: language === 'ta' ? 'ஆசிரியர்கள் உரை' : 'Staff Speech & Ceremonies', image_url: getAssetUrl('/school-images/staff-speech.png'), uploader_name: 'Alumni Desk' },
    { id: '6', title: language === 'ta' ? 'பரிசு அளிப்பு விழா' : 'Prize Distribution Day', image_url: getAssetUrl('/school-images/sudentgetprize.png'), uploader_name: 'Batch of 2010' },
  ];

  const activeMemories = (memories && memories.length > 0) ? memories : defaultRealMemories;

  return (
    <section id="memories-gallery" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
              {t('recent_memories_title')}
            </h2>
          </div>

          <button
            type="button"
            onClick={onViewAllClick}
            className="inline-flex items-center space-x-2.5 text-sm sm:text-base font-semibold text-[#111111] hover:text-[#854D0E] bg-white border-2 border-[#E5E7EB] hover:border-[#F4C542] hover:bg-[#FFF7D6]/40 px-6 py-3.5 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <span>{t('view_all_memories')}</span>
            <ArrowRight className="w-5 h-5 text-[#854D0E]" />
          </button>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {activeMemories.map((memory) => (
            <div
              key={memory.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl hover:border-[#F4C542] transition-all group relative h-60 cursor-pointer"
              onClick={onViewAllClick}
            >
              <img
                src={memory.image_url}
                alt={memory.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-base font-semibold text-[#F4C542] truncate">{memory.title}</span>
                <span className="text-sm text-gray-300 font-normal">{memory.uploader_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
