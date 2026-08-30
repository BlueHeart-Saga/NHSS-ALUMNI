import React from 'react';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface HighlightAlumnus {
  id: string;
  full_name: string;
  passing_year: number;
  profession: string;
  current_city: string;
  profile_photo_url: string;
}

interface AlumniHighlightsProps {
  highlights: HighlightAlumnus[];
}

export const AlumniHighlights: React.FC<AlumniHighlightsProps> = ({ highlights }) => {
  const { t, language } = useLanguage();

  return (
    <section id="alumni-highlights" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {language === 'ta' ? 'சிறந்த பழைய மாணவர்கள்' : 'Inspiring Alumni Stories & Roster'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal mt-2 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 inline" />
            <span>{language === 'ta' ? 'சரிபார்க்கப்பட்ட பழைய மாணவர்கள் சுயவிவரங்கள்' : 'Publicly approved profiles respecting privacy settings'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((alumnus) => (
            <div
              key={alumnus.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-2 flex flex-col items-center text-center relative overflow-hidden group"
            >
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="relative mb-5">
                  <img
                    src={alumnus.profile_photo_url}
                    alt={alumnus.full_name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#F4C542] shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 bg-[#111111] text-[#F4C542] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#F4C542]">
                    {alumnus.passing_year}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#111111] group-hover:text-[#854D0E] transition-colors mb-2">
                  {alumnus.full_name}
                </h3>

                <div className="space-y-1 text-sm text-gray-600 font-medium">
                  {alumnus.profession && (
                    <div className="flex items-center justify-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-[#854D0E]" />
                      <span className="truncate">{alumnus.profession}</span>
                    </div>
                  )}
                  {alumnus.current_city && (
                    <div className="flex items-center justify-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-[#854D0E]" />
                      <span>{alumnus.current_city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
