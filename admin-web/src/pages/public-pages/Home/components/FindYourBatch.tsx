import React, { useState } from 'react';
import { GraduationCap, Search, Users, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface BatchItem {
  id: string;
  name: string;
  passing_year: number;
  total_members: number;
  cities_count: number;
  upcoming_events_count: number;
  coordinator_profiles?: {
    id: string;
    full_name: string;
    profile_photo_url?: string;
    profession?: string;
  }[];
}

interface FindYourBatchProps {
  batches: BatchItem[];
  onSelectBatch: (year: number) => void;
}

export const FindYourBatch: React.FC<FindYourBatchProps> = ({ batches, onSelectBatch }) => {
  const { t, language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number | ''>(2010);
  const [activeResult, setActiveResult] = useState<BatchItem | null>(
    batches.find(b => b.passing_year === 2010) || batches[0] || null
  );

  // Sync activeResult when batches load
  React.useEffect(() => {
    if (batches.length > 0 && !activeResult) {
      const found = batches.find(b => b.passing_year === Number(selectedYear)) || batches[0];
      setActiveResult(found);
    }
  }, [batches]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;
    const found = batches.find(b => b.passing_year === Number(selectedYear));
    if (found) {
      setActiveResult(found);
    } else {
      setActiveResult({
        id: `batch-${selectedYear}`,
        name: `${selectedYear} ${language === 'ta' ? 'ஆம் ஆண்டு வகுப்பு' : 'Class of'}`,
        passing_year: Number(selectedYear),
        total_members: 0,
        cities_count: 0,
        upcoming_events_count: 0
      });
    }
  };

  const yearOptions = batches.length > 0
    ? batches.map(b => b.passing_year).sort((a, b) => b - a)
    : Array.from({ length: 30 }, (_, i) => 2025 - i);

  return (
    <section id="find-your-batch" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {t('find_batch_title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
            {t('find_batch_desc')}
          </p>
        </div>

        {/* Batch Selector Form */}
        <form onSubmit={handleSearch} className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-8 sm:p-10 shadow-xl max-w-2xl mx-auto space-y-6 transition-all hover:shadow-2xl">
          <div className="text-left space-y-2">
            <label className="block text-sm font-semibold text-[#111111] uppercase tracking-wider">
              {language === 'ta' ? 'தேர்ச்சி பெற்ற ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Graduation Batch Year'}
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-lg font-semibold text-[#111111] focus:bg-white focus:border-[#F4C542] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    {language === 'ta' ? `${y} ஆம் ஆண்டு (Batch of ${y})` : `Class of ${y}`}
                  </option>
                ))}
              </select>
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#854D0E] pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-8 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-base uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-3 border border-[#F4C542]/40 cursor-pointer"
          >
            <Search className="w-5 h-5 text-[#F4C542]" />
            <span>{language === 'ta' ? 'வகுப்பைத் தேடுக' : 'Find My Batch Members'}</span>
          </button>
        </form>

        {/* Active Result Card */}
        {activeResult && (
          <div className="bg-[#FFF7D6]/50 border-2 border-[#F4C542]/60 rounded-3xl p-8 max-w-2xl mx-auto text-left space-y-6 animate-fadeIn shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#854D0E] uppercase tracking-widest bg-[#F4C542]/30 px-3 py-1 rounded-md">
                  {activeResult.passing_year}
                </span>
                <h3 className="text-2xl font-bold text-[#111111] mt-2">
                  {activeResult.name}
                </h3>
              </div>
              <Sparkles className="w-8 h-8 text-[#854D0E]" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F4C542]/30 text-center">
              <div>
                <div className="text-2xl font-bold text-[#111111]">{activeResult.total_members}</div>
                <div className="text-xs text-gray-600 font-medium">{language === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111111]">{activeResult.cities_count}</div>
                <div className="text-xs text-gray-600 font-medium">{language === 'ta' ? 'நகரங்கள்' : 'Cities'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111111]">{activeResult.upcoming_events_count}</div>
                <div className="text-xs text-gray-600 font-medium">{language === 'ta' ? 'நிகழ்வுகள்' : 'Events'}</div>
              </div>
            </div>

            {/* Coordinator Profile Avatars */}
            {activeResult.coordinator_profiles && activeResult.coordinator_profiles.length > 0 && (
              <div className="pt-4 border-t border-[#F4C542]/30 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#854D0E]">
                  {language === 'ta' ? 'ஒருங்கிணைப்பாளர்கள்' : 'Coordinators'}:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {activeResult.coordinator_profiles.slice(0, 3).map((c, i) => (
                      <img
                        key={c.id || i}
                        src={
                          c.profile_photo_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=F4C542&color=111111`
                        }
                        alt={c.full_name}
                        title={c.full_name}
                        className="w-7 h-7 rounded-full ring-2 ring-white object-cover border border-amber-300"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#111111]">
                    {activeResult.coordinator_profiles.map(c => c.full_name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelectBatch(activeResult.passing_year)}
              className="w-full py-3.5 px-6 bg-[#F4C542] hover:bg-[#E0B238] text-[#111111] font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{t('view_batch_members')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
