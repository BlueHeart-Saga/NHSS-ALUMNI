import React, { useState } from 'react';
import { Building2, MapPin, ShieldCheck, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../../context/LanguageContext';
import { Modal } from '../../../../components/Modal';
import { HighlightsSkeleton } from './SkeletonLoaders';

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
  loading?: boolean;
}

export const AlumniHighlights: React.FC<AlumniHighlightsProps> = ({ highlights, loading }) => {
  const { t, language } = useLanguage();
  const [previewImage, setPreviewImage] = useState<HighlightAlumnus | null>(null);

  return (
    <section id="alumni-highlights" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] tracking-tight">
            {language === 'ta' ? 'நமது பள்ளி பழைய மாணவர்கள்' : 'Some of Our Alumni & Students'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal mt-2 flex items-center justify-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 inline" />
            <span>{language === 'ta' ? 'சரிபார்க்கப்பட்ட பள்ளி மாணவர்கள் சுயவிவரங்கள்' : 'Verified profiles of our school graduates'}</span>
          </p>
        </div>

        {loading ? (
          <HighlightsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((alumnus) => (
            <div
              key={alumnus.id}
              className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-[#F4C542] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center text-center relative overflow-hidden group"
            >
              {/* Bottom-to-Top Glass Fill Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFF7D6]/80 via-[#FFF7D6]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-none -z-0" />

              <div className="relative z-10 w-full flex flex-col items-center">
                {/* Year Pill Top Right */}
                <div className="w-full flex justify-end mb-2">
                  <span className="text-[11px] font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542]/50 px-2.5 py-0.5 rounded-full shadow-2xs">
                    Batch {alumnus.passing_year}
                  </span>
                </div>

                {/* Profile Photo (Borderless with soft shadow, click to preview) */}
                <div
                  onClick={() => setPreviewImage(alumnus)}
                  className="relative mb-4 cursor-pointer group-hover:scale-105 active:scale-95 transition-transform"
                >
                  <img
                    src={
                      alumnus.profile_photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.full_name)}&background=F4C542&color=111111`
                    }
                    alt={alumnus.full_name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md hover:shadow-xl hover:brightness-105 transition-all"
                  />
                </div>

                <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#854D0E] transition-colors mb-1.5 line-clamp-1">
                  {alumnus.full_name}
                </h3>

                <div className="space-y-1 text-xs text-gray-600 font-medium w-full">
                  {alumnus.profession && (
                    <div className="flex items-center justify-center space-x-1.5 bg-gray-50/80 border border-gray-100 py-1 px-3 rounded-full">
                      <Briefcase className="w-3.5 h-3.5 text-[#854D0E] shrink-0" />
                      <span className="truncate max-w-[160px] font-semibold text-[#111111]">{alumnus.profession}</span>
                    </div>
                  )}
                  {alumnus.current_city && (
                    <div className="flex items-center justify-center space-x-1.5 pt-1 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-[#854D0E] shrink-0" />
                      <span className="truncate">{alumnus.current_city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* View More Students Button Section */}
        <div className="mt-12 text-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center space-x-2 py-4 px-8 bg-[#111111] hover:bg-black text-[#F4C542] font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl transition-all border border-[#F4C542]/40 cursor-pointer"
          >
            <span>{language === 'ta' ? 'மேலும் மாணவர்களைக் காண' : 'View More Students'}</span>
            <ArrowRight className="w-4 h-4 text-[#F4C542]" />
          </Link>
        </div>
      </div>

      {/* Full-size Profile Image Lightbox Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          title={previewImage.full_name}
        >
          <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
            <img
              src={
                previewImage.profile_photo_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(previewImage.full_name)}&background=F4C542&color=111111`
              }
              alt={previewImage.full_name}
              className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#854D0E] bg-[#FFF7D6] border border-[#F4C542] px-4 py-1.5 rounded-full inline-block">
                Batch of {previewImage.passing_year}
              </span>
              {previewImage.profession && (
                <p className="text-sm font-semibold text-[#111111] mt-2">
                  {previewImage.profession} {previewImage.current_city ? `• ${previewImage.current_city}` : ''}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};
