import React from 'react';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';

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
  return (
    <section id="alumni-highlights" className="py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          {/* <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] border-2 border-[#F4C542] px-5 py-2 rounded-full uppercase tracking-wider">
            ALUMNI HIGHLIGHTS
          </span> */}
          <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] tracking-tight pt-2">
            Inspiring Alumni Stories &amp; Roster
          </h2>
          <p className="text-lg text-gray-600 font-normal mt-2 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 inline" />
            <span>Publicly approved profiles respecting privacy settings</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((alumnus) => (
            <div
              key={alumnus.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-md hover:shadow-2xl hover:border-[#F4C542] transition-all duration-500 transform hover:-translate-y-2 flex flex-col items-center text-center relative overflow-hidden group"
            >
              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/90 via-[#FFF7D6]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

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

                <h3 className="font-semibold text-xl sm:text-2xl text-[#111111]">{alumnus.full_name}</h3>
                <span className="text-sm font-semibold text-[#854D0E] bg-[#FFF7D6] px-3.5 py-1 rounded-full mt-1.5 border border-[#F4C542]/60">
                  Class of {alumnus.passing_year}
                </span>

                <div className="mt-5 space-y-2 text-base text-gray-600 font-normal w-full pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 truncate font-semibold text-[#111111]">
                    <Building2 className="w-5 h-5 text-[#854D0E]" />
                    <span className="truncate">{alumnus.profession}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <MapPin className="w-5 h-5 text-[#854D0E]" />
                    <span>{alumnus.current_city}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
