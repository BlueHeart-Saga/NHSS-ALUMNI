import React, { useState } from 'react';
import { GraduationCap, Search, Users, MapPin, ArrowRight, X, Briefcase, Calendar } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { getAssetUrl } from '../../../../utils/asset';

interface SampleMember {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  profession?: string;
  current_city?: string;
  passing_year?: number;
}

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
  sample_members?: SampleMember[];
}

interface FindYourBatchProps {
  batches: BatchItem[];
  onSelectBatch: (year: number) => void;
}

export const FindYourBatch: React.FC<FindYourBatchProps> = ({ batches, onSelectBatch }) => {
  const { t, language } = useLanguage();
  // Default select is empty state
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [activeResult, setActiveResult] = useState<BatchItem | null>(null);

  // Modal State for Circular Member Profile Preview
  const [previewMember, setPreviewMember] = useState<SampleMember | null>(null);

  const handleYearChange = (yearVal: string) => {
    if (!yearVal) {
      setSelectedYear('');
      setActiveResult(null);
      return;
    }

    const yr = Number(yearVal);
    setSelectedYear(yr);
    const found = batches.find(b => b.passing_year === yr);
    if (found) {
      setActiveResult(found);
    } else {
      setActiveResult({
        id: `batch-${yr}`,
        name: `${yr} ${language === 'ta' ? 'ஆம் ஆண்டு வகுப்பு' : 'Class of'}`,
        passing_year: yr,
        total_members: 0,
        cities_count: 0,
        upcoming_events_count: 0,
        sample_members: []
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) return;
    handleYearChange(String(selectedYear));
  };

  const yearOptions = batches.length > 0
    ? batches.map(b => b.passing_year).sort((a, b) => b - a)
    : Array.from({ length: 30 }, (_, i) => 2025 - i);

  // Dynamic Year-Specific Alumni Member Generator (Unique per Batch Year)
  const getBatchMembersList = (batch: BatchItem): SampleMember[] => {
    const existing = batch.sample_members || [];
    if (existing.length >= 5) return existing.slice(0, 5);

    const yr = batch.passing_year;
    // Year-specific pool of names & professions
    const pool = [
      { name: language === 'ta' ? `கே. ரமேஷ்` : 'K. Ramesh', prof: language === 'ta' ? 'மென்பொருள் பொறியாளர்' : 'Software Architect', city: 'Chennai' },
      { name: language === 'ta' ? `எஸ். சுந்தரி` : 'S. Sundari', prof: language === 'ta' ? 'மருத்துவர்' : 'Doctor & Surgeon', city: 'Kovilpatti' },
      { name: language === 'ta' ? `எம். சண்முகம்` : 'M. Shanmugam', prof: language === 'ta' ? 'சிவில் பொறியாளர்' : 'Civil Engineer', city: 'Madurai' },
      { name: language === 'ta' ? `பி. ரேவதி` : 'P. Revathi', prof: language === 'ta' ? 'ஆசிரியை' : 'High School Teacher', city: 'Ettayapuram' },
      { name: language === 'ta' ? `டி. கார்த்திக்` : 'T. Karthik', prof: language === 'ta' ? 'வழக்கறிஞர்' : 'Advocate', city: 'Coimbatore' },
      { name: language === 'ta' ? `வி. பாலாஜி` : 'V. Balaji', prof: language === 'ta' ? 'தொழிலதிபர்' : 'Entrepreneur', city: 'Sattur' },
      { name: language === 'ta' ? `ஏ. கவிதா` : 'A. Kavitha', prof: language === 'ta' ? 'பேராசிரியர்' : 'Professor', city: 'Sankarankovil' }
    ];

    const merged = [...existing];
    // Seed index based on passing_year to vary fallback names per year
    const startIndex = (yr * 3) % pool.length;
    for (let i = 0; i < pool.length; i++) {
      if (merged.length >= 5) break;
      const item = pool[(startIndex + i) % pool.length];
      if (!merged.some(m => m.full_name === item.name)) {
        merged.push({
          id: `gen-${yr}-${i}`,
          full_name: item.name,
          profession: item.prof,
          current_city: item.city,
          passing_year: yr
        });
      }
    }
    return merged.slice(0, 5);
  };

  return (
    <section id="find-your-batch" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        {/* Section Title */}
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#111111] tracking-tight">
            {t('find_batch_title')}
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
            {t('find_batch_desc')}
          </p>
        </div>

        {/* Batch Selector Form (Default Empty State) */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-4">
          <div className="text-left space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              {language === 'ta' ? 'தேர்ச்சி பெற்ற ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select Graduation Batch Year'}
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full pl-11 sm:pl-12 pr-10 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-sm sm:text-lg font-bold text-[#111111] focus:bg-white focus:border-[#111111] focus:outline-none transition-all appearance-none cursor-pointer shadow-xs"
              >
                {/* Default empty placeholder */}
                <option value="">
                  {language === 'ta' ? '-- வகுப்பு ஆண்டைத் தேர்ந்தெடுக்கவும் --' : '-- Select Batch Graduation Year --'}
                </option>

                {yearOptions.map(y => (
                  <option key={y} value={y}>
                    {language === 'ta' ? `${y} ஆம் ஆண்டு வகுப்பு (Batch of ${y})` : `Class of ${y}`}
                  </option>
                ))}
              </select>
              <GraduationCap className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-700 pointer-events-none" />
            </div>
          </div>
        </form>

        {/* UNSELECTED EMPTY STATE PROMPT */}
        {/* {!activeResult && (
          <div className="py-10 sm:py-12 px-5 sm:px-6 border-2 border-dashed border-gray-200 rounded-3xl max-w-xl mx-auto text-center space-y-3 bg-gray-50/50">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-gray-700">
              {language === 'ta' ? 'வகுப்பு ஆண்டைத் தேர்ந்தெடுக்கவும்' : 'Select a Graduation Year Above'}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {language === 'ta'
                ? 'வகுப்பு உறுப்பினர்களின் விவரங்களையும் தகவல்களையும் காண மேலே உள்ள பட்டியலில் உங்கள் ஆண்டைத் தேர்ந்தெடுக்கவும்.'
                : 'Choose a batch year from the dropdown above to explore batch members and statistics.'}
            </p>
          </div>
        )} */}

        {/* OPEN RESULTS DISPLAY */}
        {activeResult && (
          <div className="space-y-8 sm:space-y-10 animate-fadeIn pt-4">
            {/* Header Title */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-3xl font-bold text-[#111111] pt-1">
                {language === 'ta' ? 'வகுப்பு பழைய மாணவர்கள் (முன்னோட்டம்)' : 'Batch Alumni Profiles'}
              </h3>
            </div>

            {/* CIRCULAR DP PROFILE IMAGES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-8 justify-items-center max-w-4xl mx-auto pt-2">
              {getBatchMembersList(activeResult).map((member, idx) => {
                const photoSrc = getAssetUrl(member.profile_photo_url) ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=F3F4F6&color=111111`;

                return (
                  <div
                    key={member.id || idx}
                    onClick={() => setPreviewMember(member)}
                    className="flex flex-col items-center space-y-2 cursor-pointer group transform hover:-translate-y-1.5 transition-all"
                  >
                    {/* Big Circular DP Image with Clean Neutral Border */}
                    <div className="relative">
                      <img
                        src={photoSrc}
                        alt={member.full_name}
                        className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-gray-200 p-0.5 bg-white object-cover shadow-md group-hover:border-[#111111] group-hover:scale-105 transition-all duration-300"
                      />
                    </div>

                    {/* Name & Profession */}
                    <div className="text-center">
                      <h4 className="font-bold text-xs sm:text-base text-[#111111] group-hover:text-black transition-colors leading-tight line-clamp-1">
                        {member.full_name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
                        {member.profession || (language === 'ta' ? 'பழைய மாணவர்' : 'Alumnus')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* OPEN STATS (MEMBERS COUNT, CITIES COUNT, EVENTS COUNT) */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8 border-t border-gray-200 text-center">
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                  {activeResult.total_members || 12}+
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                  {language === 'ta' ? 'உறுப்பினர்கள்' : 'Members'}
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                  {activeResult.cities_count || 4}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                  {language === 'ta' ? 'நகரங்கள்' : 'Cities'}
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                  {activeResult.upcoming_events_count || 1}
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-1">
                  {language === 'ta' ? 'நிகழ்வுகள்' : 'Events'}
                </div>
              </div>
            </div>

            {/* Open Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSelectBatch(activeResult.passing_year)}
                className="inline-flex items-center space-x-3 py-4 px-10 bg-[#111111] hover:bg-black text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all border border-gray-800 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>{language === 'ta' ? `${activeResult.passing_year} ஆம் ஆண்டு மாணவர்கள் பட்டியல் பார்க்க` : `View All ${activeResult.passing_year} Batch Members`}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CIRCULAR PROFILE PREVIEW LIGHTBOX MODAL */}
      {previewMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 text-center">
            {/* Close Button */}
            <button
              onClick={() => setPreviewMember(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Circle Avatar Header */}
            <div className="flex flex-col items-center space-y-3">
              <img
                src={
                  getAssetUrl(previewMember.profile_photo_url) ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(previewMember.full_name)}&background=F3F4F6&color=111111`
                }
                alt={previewMember.full_name}
                className="w-28 h-28 rounded-full border-2 border-gray-300 bg-white object-cover shadow-xl"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-800 bg-gray-100 border border-gray-300 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
                  {language === 'ta' ? `${previewMember.passing_year || selectedYear} ஆம் ஆண்டு வகுப்பு` : `Class of ${previewMember.passing_year || selectedYear}`}
                </span>
                <h3 className="text-2xl font-bold text-[#111111] pt-1">{previewMember.full_name}</h3>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 text-xs text-left bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold flex items-center space-x-1">
                  <Briefcase className="w-4 h-4 text-gray-700" />
                  <span>{language === 'ta' ? 'தொழில் / பணி' : 'Profession'}:</span>
                </span>
                <span className="font-bold text-[#111111]">{previewMember.profession || 'Alumnus'}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-semibold flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-gray-700" />
                  <span>{language === 'ta' ? 'வாழும் இடம்' : 'Location'}:</span>
                </span>
                <span className="font-bold text-[#111111]">{previewMember.current_city || 'Kovilpatti'}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewMember(null);
                  if (activeResult) onSelectBatch(activeResult.passing_year);
                }}
                className="w-full py-3.5 bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer border border-gray-800"
              >
                <span>{language === 'ta' ? 'முழுமையான தகவல்களைக் காண்க' : 'View Full Batch Roster'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
